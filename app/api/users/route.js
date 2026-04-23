/**
 * POST /api/users
 * GET /api/users
 */

import { getAllUsers, createUser } from '@/lib/services/userService';

export async function GET() {
  try {
    const users = await getAllUsers();
    return Response.json({ success: true, data: users, total: users.length });
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data pengguna' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const newUser = await createUser(data);
    return Response.json({ success: true, message: 'User berhasil dibuat', data: newUser }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
