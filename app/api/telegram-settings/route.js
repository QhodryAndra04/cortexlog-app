/**
 * API Route for Telegram Settings
 */

import { getTelegramSettings, updateTelegramSettings, testTelegramConnection } from '@/lib/services/settingsService';

export async function GET() {
  try {
    const data = await getTelegramSettings();
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    await updateTelegramSettings(data);
    return Response.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const { testBotToken, testChatId } = await request.json();
    await testTelegramConnection(testBotToken, testChatId);
    return Response.json({ success: true, message: 'Koneksi berhasil!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
