'use server';

import { query } from '@/lib/db';

// GET - Retrieve notifications dengan filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let queryStr = `
      SELECT 
        id_notification,
        id_ml_result,
        message,
        notification_type,
        severity_level,
        telegram_chat_id,
        related_log_id,
        status,
        retry_count,
        error_message,
        sent_at,
        created_at,
        updated_at
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

    const results = await query(queryStr, params);

    return Response.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return Response.json(
      { error: 'Gagal mengambil notifikasi: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(request) {
  try {
    const {
      idMlResult,
      message,
      notificationType,
      severityLevel = 'High',
      telegramChatId,
      relatedLogId,
      sendToTelegram = false,
      generatedBy = null,
    } = await request.json();

    // Validasi input
    if (!message || !notificationType) {
      return Response.json(
        { error: 'Message dan notification type harus diisi' },
        { status: 400 }
      );
    }

    // Validasi notification type
    const validTypes = ['Attack Alert', 'Warning', 'Info'];
    if (!validTypes.includes(notificationType)) {
      return Response.json(
        {
          error: 'Notification type harus salah satu dari: ' +
            validTypes.join(', '),
        },
        { status: 400 }
      );
    }

    // Validasi severity level
    const validSeverity = ['Critical', 'High', 'Medium', 'Low'];
    if (!validSeverity.includes(severityLevel)) {
      return Response.json(
        {
          error: 'Severity level harus salah satu dari: ' +
            validSeverity.join(', '),
        },
        { status: 400 }
      );
    }

    // 1. Insert notification ke database
    let status = 'Pending';
    let actualChatId = telegramChatId;

    // Jika tidak ada chat ID tapi perlu send to telegram, ambil dari settings
    if (sendToTelegram && !actualChatId) {
      const settingsResults = await query(
        `SELECT chat_id FROM telegram_settings 
         ORDER BY id DESC 
         LIMIT 1`
      );

      if (!settingsResults || settingsResults.length === 0) {
        return Response.json(
          { error: 'Telegram Chat ID belum dikonfigurasi' },
          { status: 400 }
        );
      }

      actualChatId = settingsResults[0].chat_id;
    }

    const insertResult = await query(
      `INSERT INTO notifications (
        id_ml_result, message, notification_type, severity_level, telegram_chat_id, related_log_id, status, id_report
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_notification, created_at`,
      [
        idMlResult || null,
        message,
        notificationType,
        severityLevel,
        actualChatId,
        relatedLogId || null,
        status,
        null // id_report will be set after report creation for Attack Alert
      ]
    );

    const notificationId = insertResult[0].id_notification;
    const createdAt = insertResult[0].created_at;

    // 2. Jika tipe Attack Alert, insert ke reports table dan link ke notification
    let reportId = null;
    if (notificationType === 'Attack Alert') {
      try {
        const reportResult = await query(
          `INSERT INTO reports (file_name, total_attacks, generated_by)
           VALUES ($1, $2, $3)
           RETURNING id_report`,
          [
            `attack_report_${notificationId}_${Date.now()}.xlsx`,
            1,
            generatedBy || null
          ]
        );

        reportId = reportResult[0].id_report;

        // Update notification dengan id_report
        await query(
          `UPDATE notifications SET id_report = $1 WHERE id_notification = $2`,
          [reportId, notificationId]
        );
      } catch (reportError) {
        console.error('Error inserting to reports:', reportError);
        // Continue anyway, notification already created
      }
    }

    // 3. Jika perlu send ke Telegram
    if (sendToTelegram && actualChatId) {
      try {
        // Get telegram settings
        const settingsResults = await query(
          `SELECT bot_token FROM telegram_settings 
           ORDER BY id DESC 
           LIMIT 1`
        );

        if (!settingsResults || settingsResults.length === 0) {
          return Response.json(
            { error: 'Telegram Bot Token belum dikonfigurasi' },
            { status: 400 }
          );
        }

        const botToken = settingsResults[0].bot_token;

        // Format pesan dengan icon dan severity
        let icon = 'ℹ️';
        if (notificationType === 'Attack Alert') {
          icon = '🚨';
        } else if (notificationType === 'Warning') {
          icon = '⚠️';
        }

        const severityEmoji = {
          'Critical': '🔴',
          'High': '🟠',
          'Medium': '🟡',
          'Low': '🟢'
        };

        let formattedMessage = `${icon} ${notificationType}\n${severityEmoji[severityLevel]} [${severityLevel}]\n\n${message}`;

        const botApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(botApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: actualChatId,
            text: formattedMessage,
          }),
        });

        const telResult = await response.json();

        // Update status berdasarkan response
        if (telResult.ok) {
          status = 'Sent';
          await query(
            'UPDATE notifications SET status = $1, sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id_notification = $2',
            [status, notificationId]
          );
        } else {
          status = 'Failed';
          const errorMsg = telResult.description || 'Unknown error from Telegram API';
          await query(
            'UPDATE notifications SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id_notification = $3',
            [status, errorMsg, notificationId]
          );
        }
      } catch (botError) {
        console.error('Error sending to Telegram:', botError);
        status = 'Failed';
        const errorMsg = botError.message || 'Failed to send to Telegram API';
        await query(
          'UPDATE notifications SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id_notification = $3',
          [status, errorMsg, notificationId]
        );
      }
    }

    return Response.json({
      success: true,
      data: {
        id_notification: notificationId,
        message,
        notificationType,
        severityLevel,
        status,
        created_at: createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return Response.json(
      { error: 'Gagal membuat notifikasi: ' + error.message },
      { status: 500 }
    );
  }
}
