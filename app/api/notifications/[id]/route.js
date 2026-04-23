/**
 * API Route for Notification Details (GET, PUT, DELETE)
 */

import {
  getNotificationById,
  updateNotification,
  deleteNotification,
  retryNotification,
} from "@/lib/services/notificationService";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const notification = await getNotificationById(id);
    if (!notification)
      return Response.json(
        { error: "Notifikasi tidak ditemukan" },
        { status: 404 },
      );
    return Response.json({ success: true, data: notification });
  } catch (error) {
    return Response.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, retryAttempt = false } = await request.json();

    if (retryAttempt) {
      const result = await retryNotification(id);
      return Response.json({
        success: result.success,
        data: {
          id_notification: parseInt(id),
          status: result.success ? "Sent" : "Failed",
          retryCount: result.retryCount,
        },
      });
    }

    await updateNotification(id, { status });
    return Response.json({
      success: true,
      message: "Status notifikasi berhasil diperbarui",
      data: { id_notification: parseInt(id), status },
    });
  } catch (error) {
    const status = error.message.includes("Batas maksimal") ? 400 : 404;
    return Response.json({ error: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteNotification(id);
    return Response.json({
      success: true,
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
