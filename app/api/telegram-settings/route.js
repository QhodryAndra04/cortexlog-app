import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const results = await query(
      'SELECT id, bot_token, chat_id, alert_level, is_enabled FROM telegram_settings LIMIT 1'
    );

    if (!results || results.length === 0) {
      // Return default if no settings exist
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
        enabled: settings.is_enabled === 1,
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

    // Update or insert settings
    const checkResults = await query(
      'SELECT id FROM telegram_settings LIMIT 1'
    );

    if (checkResults.length === 0) {
      // Insert new settings
      await query(
        'INSERT INTO telegram_settings (bot_token, chat_id, alert_level, is_enabled) VALUES (?, ?, ?, ?)',
        [botToken, chatId, alertLevel, enabled ? 1 : 0]
      );
    } else {
      // Update existing settings
      await query(
        'UPDATE telegram_settings SET bot_token = ?, chat_id = ?, alert_level = ?, is_enabled = ?, updated_at = NOW()',
        [botToken, chatId, alertLevel, enabled ? 1 : 0]
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
    const { testBotToken, testChatId } = await request.json();

    // Validasi input
    if (!testBotToken || !testChatId) {
      return Response.json(
        { error: 'Token bot dan chat ID harus diisi' },
        { status: 400 }
      );
    }

    // Test connection to Telegram Bot API
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
  } catch (error) {
    console.error('Error testing telegram connection:', error);
    return Response.json(
      { error: 'Gagal menguji koneksi Telegram: ' + error.message },
      { status: 500 }
    );
  }
}
