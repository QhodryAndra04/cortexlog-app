/**
 * API Route for User Detail (GET, PUT, DELETE)
 */

import { getUserById, updateUser, deleteUser } from '@/lib/services/userService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const user = await getUserById(id);
    if (!user) return Response.json({ error: 'User tidak ditemukan' }, { status: 404 });
    return Response.json({ success: true, data: user });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    const success = await updateUser(id, data);
    if (!success) return Response.json({ error: 'Tidak ada data yang diupdate' }, { status: 400 });
    return Response.json({ success: true, message: 'User berhasil diperbarui' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deleteUser(id);
    return Response.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
