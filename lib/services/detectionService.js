import { query } from '@/lib/db';
import { createNotification } from './notificationService';
import { createReportRecord } from './reportService';
import { sendTelegramAlert } from '@/lib/telegram';

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

/**
 * Service untuk menangani deteksi anomali (ML) dan alur notifikasi.
 */

export function mapSeverity(threatLevel) {
  if (!threatLevel) return 'Medium';
  const atk = threatLevel.toUpperCase();
  const map = { CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
  return map[atk] ?? 'Medium';
}

export function mapNotificationType(isAttack, isAnomaly) {
  if (isAttack)   return 'Attack Alert';
  if (isAnomaly)  return 'Warning';
  return 'Info';
}

/**
 * Panggil API FastAPI untuk batch deteksi
 */
export async function detectAnomaliesBatch(parsedLogs, ipStats) {
  const batchPayload = {
    logs: parsedLogs.map(log => {
      const ipStat = ipStats[log.ip_address] || {};
      return {
        ip:             log.ip_address,
        method:         log.method,
        url:            log.request_url,
        status_code:    log.status_code,
        response_size:  log.bytes_sent,
        user_agent:     log.user_agent ?? '',
        timestamp:      log.raw_log.match(/\[([^\]]+)\]/)?.[1] ?? '',
        referer:        log.referrer,
        request_count:  ipStat.request_count  ?? 1,
        error_count:    ipStat.error_count     ?? 0,
        login_attempts: ipStat.login_attempts  ?? 0,
        failed_auth:    ipStat.failed_auth     ?? 0,
      };
    })
  };

  try {
    const res = await fetch(`${ML_API_URL}/predict/batch/combined`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(batchPayload),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('FastAPI unreachable:', err.message);
  }
  return [];
}

/**
 * Simpan hasil per baris log ke Database dan kirim alert jika perlu
 */
export async function processLogResult(log, mlResponse, skipTelegram = false) {
  const summary = mlResponse?.summary ?? {};
  
  let idParsed = null;
  try {
    const insertParsed = await query(
      `INSERT INTO parsed_logs (ip_address, timestamp, method, request_url, http_version, status_code, bytes_sent, referrer, user_agent, raw_log)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_parsed`,
      [log.ip_address, log.timestamp, log.method, log.request_url, log.http_version, log.status_code, log.bytes_sent, log.referrer, log.user_agent, log.raw_log]
    );
    idParsed = insertParsed[0].id_parsed;
  } catch (err) {
    console.error('Error insert parsed_logs:', err);
    return null;
  }

  let idMlResult = null;
  if (mlResponse && idParsed) {
    try {
      const insertML = await query(
        `INSERT INTO machine_learning_results 
         (id_parsed, anomaly_score, is_anomaly, attack_type, confidence_score)
         VALUES ($1, $2, $3, $4, $5) RETURNING id_ml_result`,
        [idParsed, summary.anomaly_score ?? 0, summary.is_anomaly ?? false, summary.attack_type ?? 'Normal', summary.confidence ?? 0]
      );
      idMlResult = insertML[0].id_ml_result;
    } catch (err) {
      console.error('Error insert machine_learning_results:', err);
    }

    if ((summary.is_anomaly || summary.is_attack) && idMlResult) {
      const notifType = mapNotificationType(summary.is_attack, summary.is_anomaly);
      const severity  = mapSeverity(summary.threat_level);
      
      let displayType = summary.attack_type;
      if (!summary.is_attack && summary.is_anomaly) {
        displayType = "Anomali (Aktivitas Mencurigakan)";
      }

      const message = [
        `IP: ${log.ip_address}`,
        `URL: ${log.request_url}`,
        `Method: ${log.method}  Status: ${log.status_code}`,
        `Indikasi: ${displayType}`
      ].join('\n');

      try {
        const notifResult = await createNotification({
          idMlResult,
          message,
          notificationType: notifType,
          severityLevel: severity,
          sendToTelegram: !skipTelegram
        });
        
        return { 
          id_notification: notifResult.id, 
          notifType, 
          summary, 
          message 
        };
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    }
  }

  return { idParsed, summary };
}

/**
 * Memproses hasil deteksi dalam jumlah banyak (batch).
 * Mengatur pembuatan notifikasi, pelaporan otomatis, dan pengiriman Telegram.
 */
export async function processDetectionBatch(parsedLogs, mlBatchResponse, userId = null) {
    let totalAnomalies = 0;
    let totalAttacks = 0;
    const attackCounts = {};
    const createdNotifications = [];
    const attackDetails = [];
    
    for (let i = 0; i < parsedLogs.length; i++) {
      const result = await processLogResult(parsedLogs[i], mlBatchResponse[i], true);
      if (!result) continue;

      const summary = result.summary || {};
      if (summary.is_anomaly) totalAnomalies++;
      if (summary.is_attack) totalAttacks++;
      
      if (summary.is_attack || summary.is_anomaly) {
        const atkType = summary.attack_type || (summary.is_anomaly ? 'Anomaly' : 'Unknown');
        if (atkType !== 'Normal') {
          attackCounts[atkType] = (attackCounts[atkType] || 0) + 1;
          
          // Simpan rincian untuk Telegram (Maks 8 rincian agar tidak kepanjangan)
          if (attackDetails.length < 8) {
            attackDetails.push({
              ip: parsedLogs[i].ip_address,
              type: atkType,
              log: parsedLogs[i].raw_log
            });
          }
        }
      }

      if (result.id_notification) {
        createdNotifications.push({ 
          id_notification: result.id_notification, 
          notifType: result.notifType 
        });
      }
    }

    const attackAlerts = createdNotifications.filter(n => n.notifType === 'Attack Alert');
    let reportId = null;
    if (attackAlerts.length > 0) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const fileName = `Laporan_Harian_${today}.xlsx`;
        const report = await createReportRecord({ 
          fileName, 
          totalAttacks: attackAlerts.length, 
          generatedBy: (userId && typeof userId === 'number') ? userId : null 
        });
        reportId = report.id_report;

        for (const notif of attackAlerts) {
          await query(`UPDATE notifications SET id_report = $1 WHERE id_notification = $2`, [reportId, notif.id_notification]);
        }
      } catch (err) {
        console.error('Error auto report in service:', err);
      }
    }

    // --- BATCH TELEGRAM SUMMARY ---
    if (totalAttacks > 0 || totalAnomalies > 0) {
      let summaryMsg = `📈 <b>Log Analysis Summary</b>\n\n`;
      summaryMsg += `✅ Total Logs: <b>${parsedLogs.length}</b>\n`;
      summaryMsg += `🛑 Total Attacks: <b>${totalAttacks}</b>\n`;
      summaryMsg += `⚠️ Total Anomalies: <b>${totalAnomalies}</b>\n\n`;
      
      if (Object.keys(attackCounts).length > 0) {
        summaryMsg += `🔍 <b>Distribution:</b>\n`;
        for (const [type, count] of Object.entries(attackCounts)) {
          summaryMsg += `• ${type}: ${count}\n`;
        }
      }

      // Tambahkan rincian log lengkap (Limited)
      if (attackDetails.length > 0) {
        summaryMsg += `\n📝 <b>Attack Details:</b>\n`;
        attackDetails.forEach((item, idx) => {
          summaryMsg += `\n${idx+1}. <b>${item.type}</b> from <code>${item.ip}</code>\n`;
          summaryMsg += `<code>${item.log}</code>\n`;
        });
        
        if (totalAttacks + totalAnomalies > 8) {
          summaryMsg += `\n<i>...and ${totalAttacks + totalAnomalies - 8} other incidents.</i>\n`;
        }
      }

      if (reportId) {
        summaryMsg += `\n📄 <b>Report ID:</b> #${reportId}\n`;
      }

    try {
      await sendTelegramAlert(summaryMsg);
    } catch (err) {
      console.error('Error sending batch telegram summary:', err);
    }
  }

  return {
    total_logs: parsedLogs.length,
    total_anomalies: totalAnomalies,
    total_attacks: totalAttacks,
    attack_distribution: attackCounts,
    report_id: reportId,
  };
}
