/**
 * API Route for Notifications
 */

import { getNotifications, createNotification } from '@/lib/services/notificationService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit')) || 50;

    const results = await getNotifications({ status, type, severity, limit });

    return Response.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil notifikasi' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createNotification(data);
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
