import { query } from '@/lib/db';

export async function sendTelegramAlert(message) {
  try {
    // Ambil token dari database
    const settings = await query("SELECT bot_token, chat_id FROM telegram_settings WHERE is_enabled = true LIMIT 1");
    
    if (!settings || settings.length === 0) {
      console.warn("Telegram tidak aktif di setting Database (atau data kosong). Notifikasi dilewati.");
      return false;
    }

    const token = settings[0].bot_token;
    const chatId = settings[0].chat_id;
  
    if (!token || !chatId) {
      console.warn("Token Telegram / Chat ID tidak lengkap di database.");
      return false;
    }
  
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🚨 <b>CORTEXLOG SECURITY ALERT</b> 🚨\n\n${message}`,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
       console.error("Gagal mengirim Telegram:", await response.text());
       return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error Telegram API:", err);
    return false;
  }
}
