'use server';

'use server';

import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Get telegram settings dari telegram_settings table
    const results = await query(
      `SELECT id, bot_token, chat_id, alert_level, is_enabled 
       FROM telegram_settings 
       ORDER BY id DESC 
       LIMIT 1`
    );

    if (!results || results.length === 0) {
      return Response.json({
        success: true,
        data: {
          id: null,
          botToken: '',
          chatId: '',
          alertLevel: 'warning_critical',
          enabled: false,
        },
      });
    }

    const settings = results[0];
    return Response.json({
      success: true,
      data: {
        id: settings.id,
        botToken: settings.bot_token,
        chatId: settings.chat_id,
        alertLevel: settings.alert_level,
        enabled: settings.is_enabled,
      },
    });
  } catch (error) {
    console.error('Error fetching telegram settings:', error);
    return Response.json(
      { error: 'Gagal mengambil pengaturan Telegram' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { botToken, chatId, alertLevel, enabled } = await request.json();

    // Validasi input
    if (!botToken || !chatId) {
      return Response.json(
        { error: 'Token bot dan chat ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const checkResults = await query(
      'SELECT id FROM telegram_settings LIMIT 1'
    );

    if (checkResults.length === 0) {
      // Insert new settings
      await query(
        `INSERT INTO telegram_settings (bot_token, chat_id, alert_level, is_enabled) 
         VALUES ($1, $2, $3, $4)`,
        [botToken, chatId, alertLevel || 'warning_critical', enabled]
      );
    } else {
      // Update existing settings
      await query(
        `UPDATE telegram_settings 
         SET bot_token = $1, chat_id = $2, alert_level = $3, is_enabled = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5`,
        [botToken, chatId, alertLevel || 'warning_critical', enabled, checkResults[0].id]
      );
    }

    return Response.json({
      success: true,
      message: 'Pengaturan Telegram berhasil disimpan',
    });
  } catch (error) {
    console.error('Error updating telegram settings:', error);
    return Response.json(
      { error: 'Gagal menyimpan pengaturan Telegram: ' + error.message },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const { 
      testBotToken, 
      testChatId,
      isNotification,
      message,
      notificationType,
      idMlResult,
      relatedLogId
    } = await request.json();

    // Mode 1: Test Connection
    if (!isNotification) {
      if (!testBotToken || !testChatId) {
        return Response.json(
          { error: 'Token bot dan chat ID harus diisi' },
          { status: 400 }
        );
      }

      try {
        const botApiUrl = `https://api.telegram.org/bot${testBotToken}/sendMessage`;
        const response = await fetch(botApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: testChatId,
            text: '✅ Koneksi berhasil! Bot Telegram terhubung dengan Cortex Log.',
          }),
        });

        const result = await response.json();

        if (!result.ok) {
          return Response.json({
            success: false,
            error: result.description || 'Gagal mengirim pesan ke Telegram',
          }, { status: 400 });
        }

        return Response.json({
          success: true,
          message: 'Koneksi berhasil! Pesan uji telah dikirim.',
        });
      } catch (botError) {
        return Response.json({
          success: false,
          error: 'Tidak dapat terhubung ke Bot Telegram. Periksa token dan chat ID.',
        }, { status: 400 });
      }
    }

    // Mode 2: Send Notification
    if (isNotification) {
      if (!message || !notificationType || !testChatId) {
        return Response.json(
          { error: 'Message, notification type, dan chat ID harus diisi' },
          { status: 400 }
        );
      }

      // Get telegram settings dari telegram_settings table
      const settingsResults = await query(
        `SELECT bot_token, chat_id FROM telegram_settings 
         ORDER BY id DESC 
         LIMIT 1`
      );

      if (!settingsResults || settingsResults.length === 0) {
        return Response.json(
          { error: 'Pengaturan Telegram belum dikonfigurasi' },
          { status: 400 }
        );
      }

      const botToken = settingsResults[0].bot_token;
      const chatId = testChatId || settingsResults[0].chat_id;

      // 1. Insert notification ke notifications table
      const insertResult = await query(
        `INSERT INTO notifications (
          id_ml_result, message, notification_type, telegram_chat_id, related_log_id, status
        ) VALUES ($1, $2, $3, $4, $5, 'Pending')
        RETURNING id_notification`,
        [
          idMlResult || null,
          message,
          notificationType,
          testChatId,
          relatedLogId || null
        ]
      );

      const notificationId = insertResult[0]?.id_notification;

      // 2. Send message to Telegram
      try {
        const botApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        let formattedMessage = message;
        if (notificationType === 'Attack Alert') {
          formattedMessage = `🚨 ATTACK ALERT\n${message}`;
        } else if (notificationType === 'Warning') {
          formattedMessage = `⚠️ WARNING\n${message}`;
        } else if (notificationType === 'Info') {
          formattedMessage = `ℹ️ INFO\n${message}`;
        }

        const response = await fetch(botApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedMessage,
          }),
        });

        const telResult = await response.json();

        // 3. Update notification status
        let status = 'Failed';
        if (telResult.ok) {
          status = 'Sent';
        }

        await query(
          'UPDATE notifications SET status = $1 WHERE id_notification = $2',
          [status, notificationId]
        );

        return Response.json({
          success: telResult.ok,
          data: {
            notificationId,
            status,
            message: telResult.ok 
              ? 'Notifikasi berhasil dikirim ke Telegram' 
              : (telResult.description || 'Gagal mengirim notifikasi'),
          },
        });
      } catch (botError) {
        await query(
          'UPDATE notifications SET status = $1 WHERE id_notification = $2',
          ['Failed', notificationId]
        );

        return Response.json(
          {
            success: false,
            data: {
              notificationId,
              status: 'Failed',
              error: 'Gagal mengirim ke Telegram Bot API',
            },
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Error in telegram POST handler:', error);
    return Response.json(
      { error: 'Gagal memproses request: ' + error.message },
      { status: 500 }
    );
  }
}
