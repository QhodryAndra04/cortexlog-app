/**
 * POST /api/analyze-logs
 *
 * Flow lengkap:
 *  1. Terima raw Apache log lines (string)
 *  2. Simpan ke \`apache_logs\` dan parse log.
 *  3. Simpan hasil parsing ke \`parsed_logs\`.
 *  4. ML (FastAPI) menganalisis dari data parsing tersebut.
 *  5. Simpan hasil ML ke \`machine_learning_results\`.
 *  6. Jika terdeteksi anomali/serangan → buat entri di \`notifications\` (Alert).
 *  7. Buat \`reports\` Excel & simpan ke tabel laporan, hubungkan dengan alert.
 */

'use server';

import { query } from '@/lib/db';
import { sendTelegramAlert } from '@/lib/telegram';

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

// ─────────────────────────────────────────────────────────────────────────────
// Helper Format Tanggal
// Mengubah dd/Mon/YYYY:HH:MM:SS +zone menjadi format timestamp PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────
function formatTimestamp(apacheTimestamp) {
  try {
    const regex = /^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})$/;
    const m = apacheTimestamp.match(regex);
    if (!m) return new Date().toISOString();

    const [, d, mon, y, h, min, s, z] = m;
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
    const isoString = `${y}-${months[mon]}-${d}T${h}:${min}:${s}${z}`;
    return new Date(isoString).toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Parse satu baris Apache Combined Log Format
// ─────────────────────────────────────────────────────────────────────────────
function parseApacheLog(line) {
  const regex = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(.*?)\s+(HTTP\/\S+)"\s+(\d+)\s+(\d+|-)\s+"([^"]*)"\s+"([^"]*)"/;
  const m = line.match(regex);
  if (!m) return null;

  const [, ip, timestamp, method, url, http_version, statusStr, sizeStr, referer, userAgent] = m;
  return {
    raw_log:       line,
    ip_address:    ip,
    timestamp:     formatTimestamp(timestamp),
    method:        method,
    request_url:   url,
    http_version:  http_version,
    status_code:   parseInt(statusStr, 10),
    bytes_sent:    sizeStr === '-' ? 0 : parseInt(sizeStr, 10),
    referrer:      referer === '-' ? '' : referer,
    user_agent:    userAgent,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper untuk fitur agregasi IP (seperti notebook 02)
// ─────────────────────────────────────────────────────────────────────────────
function buildIpStats(parsedLogs) {
  const stats = {};
  for (const log of parsedLogs) {
    const ip = log.ip_address;
    if (!stats[ip]) {
      stats[ip] = { request_count: 0, failed_auth: 0, error_count: 0, login_attempts: 0 };
    }
    stats[ip].request_count += 1;
    if (log.status_code === 401 || log.status_code === 403) stats[ip].failed_auth += 1;
    if ([500, 502, 503, 504].includes(log.status_code))     stats[ip].error_count  += 1;
    if (/login|signin|auth/i.test(log.request_url))         stats[ip].login_attempts += 1;
  }
  return stats;
}

function mapSeverity(threatLevel) {
  const map = { HIGH: 'Critical', MEDIUM: 'High', LOW: 'Low' };
  return map[threatLevel] ?? 'Medium';
}

function mapNotificationType(isAttack, isAnomaly) {
  if (isAttack)   return 'Attack Alert';
  if (isAnomaly)  return 'Warning';
  return 'Info';
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { rawLogs, userId = null } = body;

    if (!rawLogs || typeof rawLogs !== 'string') {
      return Response.json(
        { error: 'Field "rawLogs" harus berupa string log Apache.' },
        { status: 400 }
      );
    }

    const lines = rawLogs.split('\n').filter(l => l.trim().length > 0);
    const parsedLogs = lines.map(parseApacheLog).filter(Boolean);

    if (parsedLogs.length === 0) {
      return Response.json(
        { error: 'Tidak ada baris log yang valid (format Apache Combined Log).' },
        { status: 400 }
      );
    }

    const ipStats = buildIpStats(parsedLogs);
    const createdNotifications = [];
    let report = null;
    let totalAnomalies = 0;
    let totalAttacks = 0;
    const attackCounts = {};

    // Proses berurutan per baris (database insertions and API calls)
    for (const log of parsedLogs) {
      // 1. Insert ke apache_logs
      let idApacheLog = null;
      try {
         const insertRaw = await query(
           `INSERT INTO apache_logs (ip_address, timestamp, method, request_url, status_code, user_agent, bytes_sent, http_version, referrer)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_log`,
           [log.ip_address, log.timestamp, log.method, log.request_url, log.status_code, log.user_agent, log.bytes_sent, log.http_version, log.referrer]
         );
         idApacheLog = insertRaw[0].id_log;
      } catch (err) {
         console.error('Error insert apache_logs:', err);
      }

      // 2. Insert ke parsed_logs (akan dibaca oleh model / referensi foreign key ML)
      let idParsed = null;
      try {
         const insertParsed = await query(
           `INSERT INTO parsed_logs (ip_address, timestamp, method, request_url, http_version, status_code, bytes_sent, referrer, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_parsed`,
           [log.ip_address, log.timestamp, log.method, log.request_url, log.http_version, log.status_code, log.bytes_sent, log.referrer, log.user_agent]
         );
         idParsed = insertParsed[0].id_parsed;
      } catch (err) {
         console.error('Error insert parsed_logs:', err);
      }

      // 3. Panggil Machine Learning API FastAPI
      const ipStat = ipStats[log.ip_address] || {};
      const payload = {
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

      let mlResponse = null;
      try {
        const res = await fetch(`${ML_API_URL}/predict/combined`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
        if (res.ok) mlResponse = await res.json();
      } catch (fetchErr) {
        console.error('FastAPI unreachable:', fetchErr.message);
      }

      // 4. Simpan hasil ke machine_learning_results
      let idMlResult = null;
      if (mlResponse && idParsed) {
        const summary = mlResponse.summary ?? {};
        const rfResult = mlResponse.random_forest ?? {};
        const ifResult = mlResponse.isolation_forest ?? {};
        
        try {
          const insertML = await query(
            `INSERT INTO machine_learning_results 
             (id_parsed, anomaly_score, is_anomaly, attack_type, confidence_score)
             VALUES ($1, $2, $3, $4, $5) RETURNING id_ml_result`,
            [
              idParsed, 
              ifResult.anomaly_score ?? 0, 
              summary.is_anomaly ?? false, 
              summary.attack_type ?? 'Normal', 
              rfResult.confidence ?? 0
            ]
          );
          idMlResult = insertML[0].id_ml_result;
          
          if (summary.is_anomaly) totalAnomalies++;
          if (summary.is_attack) totalAttacks++;
          if (summary.attack_type && summary.attack_type !== 'Normal') {
             attackCounts[summary.attack_type] = (attackCounts[summary.attack_type] || 0) + 1;
          }
        } catch (err) {
          console.error('Error insert machine_learning_results:', err);
        }

        // 5. Jika deteksi anomali/serangan, catat ke Notifikasi Alert
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
            const insertNotif = await query(
              `INSERT INTO notifications
               (id_ml_result, message, notification_type, severity_level, status)
               VALUES ($1, $2, $3, $4, 'Pending') RETURNING id_notification, created_at`,
              [idMlResult, message, notifType, severity]
            );
            
            createdNotifications.push({
              id_notification: insertNotif[0].id_notification,
              notifType: notifType
            });
            
            // Kirim notifikasi via Telegram!
            await sendTelegramAlert(message);
          } catch (err) {
            console.error('Error insert notifications:', err);
          }
        }
      }
    }

    // 6. Jika ada "Attack Alert", buat 1 entri di tabel Reports dan assign ke Notifikasi terkait
    const attackAlerts = createdNotifications.filter(n => n.notifType === 'Attack Alert');
    if (attackAlerts.length > 0) {
      try {
        const reportResult = await query(
          `INSERT INTO reports (file_name, total_attacks, generated_by)
           VALUES ($1, $2, $3)
           RETURNING id_report, generated_at`,
          [`auto_report_${Date.now()}.xlsx`, attackAlerts.length, userId]
        );
        report = reportResult[0];

        // Link setiap Attack Alert notification ke tabel reports ini
        for (const notif of attackAlerts) {
          await query(
            `UPDATE notifications SET id_report = $1 WHERE id_notification = $2`,
            [report.id_report, notif.id_notification]
          );
        }
      } catch (err) {
        console.error('Error membuat auto report:', err);
      }
    }

    // Return respons final
    return Response.json({
      success: true,
      summary: {
        total_logs:           lines.length,
        total_parsed:         parsedLogs.length,
        total_anomalies:      totalAnomalies,
        total_attacks:        totalAttacks,
        notifications_created: createdNotifications.length,
        attack_distribution:   attackCounts,
        report_id:             report?.id_report ?? null,
      }
    });

  } catch (error) {
    console.error('Error analyze-logs:', error);
    return Response.json(
      { error: 'Gagal memproses batch logs: ' + error.message },
      { status: 500 }
    );
  }
}
