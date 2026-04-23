import { query } from '@/lib/db';

/**
 * Service untuk mengelola pengaturan sistem (Telegram, dsb).
 */

export async function getTelegramSettings() {
  const results = await query(
    `SELECT id, bot_token, chat_id, alert_level, is_enabled 
     FROM telegram_settings 
     ORDER BY id DESC 
     LIMIT 1`
  );

  if (!results || results.length === 0) {
    return {
      id: null,
      botToken: '',
      chatId: '',
      alertLevel: 'warning_critical',
      enabled: false,
    };
  }

  const settings = results[0];
  return {
    id: settings.id,
    botToken: settings.bot_token,
    chatId: settings.chat_id,
    alertLevel: settings.alert_level,
    enabled: settings.is_enabled,
  };
}

export async function updateTelegramSettings({ botToken, chatId, alertLevel, enabled }) {
  const checkResults = await query('SELECT id FROM telegram_settings LIMIT 1');

  if (checkResults.length === 0) {
    await query(
      `INSERT INTO telegram_settings (bot_token, chat_id, alert_level, is_enabled) 
       VALUES ($1, $2, $3, $4)`,
      [botToken, chatId, alertLevel || 'warning_critical', enabled]
    );
  } else {
    await query(
      `UPDATE telegram_settings 
       SET bot_token = $1, chat_id = $2, alert_level = $3, is_enabled = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [botToken, chatId, alertLevel || 'warning_critical', enabled, checkResults[0].id]
    );
  }
  return true;
}

export async function testTelegramConnection(botToken, chatId) {
  try {
    const botApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(botApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Koneksi berhasil! Bot Telegram terhubung dengan Cortex Log.',
      }),
    });

    const result = await response.json();
    if (!result.ok) {
        throw new Error(result.description || 'Gagal mengirim pesan ke Telegram');
    }
    return true;
  } catch (error) {
    throw new Error('Tidak dapat terhubung ke Bot Telegram: ' + error.message);
  }
}
