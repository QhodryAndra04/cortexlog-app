'use server';

import { query } from '@/lib/db';

// GET - Retrieve single notification by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: 'Notification ID harus diisi' },
        { status: 400 }
      );
    }

    const results = await query(
      `SELECT 
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
      WHERE id_notification = $1`,
      [parseInt(id)]
    );

    if (!results || results.length === 0) {
      return Response.json(
        { error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: results[0],
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return Response.json(
      { error: 'Gagal mengambil notifikasi: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update notification status atau retry
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, retryAttempt = false } = await request.json();

    if (!id) {
      return Response.json(
        { error: 'Notification ID harus diisi' },
        { status: 400 }
      );
    }

    if (!status) {
      return Response.json(
        { error: 'Status harus diisi' },
        { status: 400 }
      );
    }

    // Validasi status
    const validStatus = ['Sent', 'Failed', 'Pending'];
    if (!validStatus.includes(status)) {
      return Response.json(
        {
          error: 'Status harus salah satu dari: ' + validStatus.join(', '),
        },
        { status: 400 }
      );
    }

    // Check if notification exists
    const notification = await query(
      `SELECT id_notification, retry_count, bot_token FROM notifications 
       WHERE id_notification = $1`,
      [parseInt(id)]
    );

    if (!notification || notification.length === 0) {
      return Response.json(
        { error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Jika retry attempt
    if (retryAttempt) {
      const currentRetry = notification[0].retry_count || 0;
      const maxRetry = 3;

      if (currentRetry >= maxRetry) {
        return Response.json(
          {
            success: false,
            error: `Max retry attempts (${maxRetry}) reached`,
          },
          { status: 400 }
        );
      }

      // Try send to Telegram again
      try {
        // Get current notification details
        const notif = await query(
          `SELECT message, telegram_chat_id, notification_type FROM notifications 
           WHERE id_notification = $1`,
          [parseInt(id)]
        );

        if (!notif || notif.length === 0) {
          return Response.json(
            { error: 'Notifikasi tidak ditemukan' },
            { status: 404 }
          );
        }

        // Get bot token from settings
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
        const message = notif[0].message;
        const chatId = notif[0].telegram_chat_id;
        const notificationType = notif[0].notification_type;

        // Format pesan dengan icon
        let icon = 'ℹ️';
        if (notificationType === 'Attack Alert') {
          icon = '🚨';
        } else if (notificationType === 'Warning') {
          icon = '⚠️';
        }

        let formattedMessage = `${icon} ${notificationType}\n(Retry ${currentRetry + 1})\n\n${message}`;

        const botApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const response = await fetch(botApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: formattedMessage,
          }),
        });

        const telResult = await response.json();

        if (telResult.ok) {
          status = 'Sent';
          await query(
            `UPDATE notifications 
             SET status = $1, retry_count = $2, sent_at = CURRENT_TIMESTAMP, 
                 error_message = NULL, updated_at = CURRENT_TIMESTAMP 
             WHERE id_notification = $3`,
            [status, currentRetry + 1, parseInt(id)]
          );
        } else {
          const errorMsg = telResult.description || 'Unknown error from Telegram API';
          await query(
            `UPDATE notifications 
             SET status = 'Failed', retry_count = $1, error_message = $2, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id_notification = $3`,
            [currentRetry + 1, errorMsg, parseInt(id)]
          );
        }

        return Response.json({
          success: telResult.ok,
          data: {
            id_notification: parseInt(id),
            status: telResult.ok ? 'Sent' : 'Failed',
            retryCount: currentRetry + 1,
          },
        });
      } catch (botError) {
        console.error('Error retrying telegram send:', botError);
        const errorMsg = botError.message || 'Failed to send to Telegram API';
        await query(
          `UPDATE notifications 
           SET retry_count = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id_notification = $3`,
          [currentRetry + 1, errorMsg, parseInt(id)]
        );

        return Response.json(
          {
            success: false,
            error: 'Retry failed: ' + errorMsg,
          },
          { status: 400 }
        );
      }
    }

    // Normal status update tanpa retry
    await query(
      `UPDATE notifications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id_notification = $2`,
      [status, parseInt(id)]
    );

    return Response.json({
      success: true,
      message: 'Status notifikasi berhasil diperbarui',
      data: {
        id_notification: parseInt(id),
        status,
      },
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return Response.json(
      { error: 'Gagal memperbarui notifikasi: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: 'Notification ID harus diisi' },
        { status: 400 }
      );
    }

    // Check if notification exists
    const notification = await query(
      'SELECT id_notification FROM notifications WHERE id_notification = $1',
      [parseInt(id)]
    );

    if (!notification || notification.length === 0) {
      return Response.json(
        { error: 'Notifikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete notification
    await query(
      'DELETE FROM notifications WHERE id_notification = $1',
      [parseInt(id)]
    );

    return Response.json({
      success: true,
      message: 'Notifikasi berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return Response.json(
      { error: 'Gagal menghapus notifikasi: ' + error.message },
      { status: 500 }
    );
  }
}
