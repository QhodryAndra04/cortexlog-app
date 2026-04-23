import { query } from '@/lib/db';

/**
 * Service untuk mengelola Notifikasi dan pengiriman ke Telegram.
 */

export async function getNotifications({ status, type, severity, limit = 50 }) {
  let queryStr = `
    SELECT 
      id_notification, id_ml_result, message, notification_type, severity_level, 
      status, created_at
    FROM notifications
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    queryStr += ` AND status = $${params.length + 1}`;
    params.push(status);
  }

  if (type) {
    queryStr += ` AND notification_type = $${params.length + 1}`;
    params.push(type);
  }

  if (severity) {
    queryStr += ` AND severity_level = $${params.length + 1}`;
    params.push(severity);
  }

  queryStr += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  return await query(queryStr, params);
}

export async function createNotification(data) {
  const {
    idMlResult, message, notificationType, severityLevel = 'High',
    sendToTelegram = false
  } = data;

  // 1. Insert notification record
  const result = await query(
    `INSERT INTO notifications (
      id_ml_result, message, notification_type, severity_level, status
    ) VALUES ($1, $2, $3, $4, 'Pending')
    RETURNING id_notification, created_at`,
    [idMlResult || null, message, notificationType, severityLevel]
  );

  const notificationId = result[0].id_notification;

  // 2. Send to Telegram if requested (Background task - No await)
  if (sendToTelegram) {
    sendTelegramNotification(notificationId, {
        message, type: notificationType, severity: severityLevel
    }).catch(err => console.error(`Telegram background error: ${err.message}`));
  }

  return { id: notificationId, ...data };
}

export async function getNotificationById(id) {
  const results = await query(
    `SELECT 
        id_notification, id_ml_result, message, notification_type, severity_level, 
        status, retry_count, error_message, 
        sent_at, created_at, updated_at
      FROM notifications
      WHERE id_notification = $1`,
    [parseInt(id)]
  );
  return results[0] || null;
}

export async function updateNotification(id, { status }) {
  await query(
    `UPDATE notifications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id_notification = $2`,
    [status, parseInt(id)]
  );
  return true;
}

export async function deleteNotification(id) {
  await query('DELETE FROM notifications WHERE id_notification = $1', [parseInt(id)]);
  return true;
}

export async function retryNotification(id) {
  const notif = await getNotificationById(id);
  if (!notif) throw new Error('Notifikasi tidak ditemukan');

  const currentRetry = notif.retry_count || 0;
  if (currentRetry >= 3) throw new Error('Batas maksimal percobaan (3) telah tercapai');

  // Try send to Telegram again
  const success = await sendTelegramNotification(id, {
    message: notif.message,
    type: notif.notification_type,
    severity: notif.severity_level,
    isRetry: true,
    currentRetryCount: currentRetry
  });

  return { success, retryCount: currentRetry + 1 };
}

export async function sendTelegramNotification(notificationId, { 
    message, type, severity, isRetry = false, currentRetryCount = 0 
}) {
  try {
    const settings = await query('SELECT bot_token, chat_id, is_enabled FROM telegram_settings ORDER BY id DESC LIMIT 1');
    if (!settings.length) throw new Error('Pengaturan Telegram belum dikonfigurasi');
    if (!settings[0].is_enabled) return false;
    
    const { bot_token: botToken, chat_id: chatId } = settings[0];

    const icons = { 'Attack Alert': '🚨', 'Warning': '⚠️', 'Info': 'ℹ️' };
    const severityIcons = { 'Critical': '🔴', 'High': '🟠', 'Medium': '🟡', 'Low': '🟢' };
    
    let formattedMessage = `${icons[type] || 'ℹ️'} ${type}\n${severityIcons[severity] || '⚪'} [${severity}]`;
    if (isRetry) formattedMessage += `\n(Percobaan Pelangsungan #${currentRetryCount + 1})`;
    formattedMessage += `\n\n${message}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: formattedMessage }),
    });

    const resData = await response.json();
    const status = resData.ok ? 'Sent' : 'Failed';
    const errorMsg = resData.ok ? null : resData.description;

    await query(
      `UPDATE notifications 
       SET status = $1, error_message = $2, retry_count = $3, 
           sent_at = ${resData.ok ? 'CURRENT_TIMESTAMP' : 'sent_at'}, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id_notification = $4`,
      [status, errorMsg, isRetry ? currentRetryCount + 1 : currentRetryCount, notificationId]
    );

    return resData.ok;
  } catch (error) {
    await query(
      `UPDATE notifications 
       SET status = 'Failed', error_message = $1, 
           retry_count = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id_notification = $3`,
      [error.message, isRetry ? currentRetryCount + 1 : currentRetryCount, notificationId]
    );
    return false;
  }
}
