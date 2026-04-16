'use server';

import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get all users
    const users = await query(
      'SELECT id_user, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    return Response.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { username, email, password, role } = await request.json();

    // Validasi input
    if (!username || !email || !password || !role) {
      return Response.json(
        { error: 'Semua field (username, email, password, role) harus diisi' },
        { status: 400 }
      );
    }

    // Validasi role
    if (!['super_admin', 'admin'].includes(role)) {
      return Response.json(
        { error: 'Role harus super_admin atau admin' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah ada
    const existingUsers = await query(
      'SELECT id_user FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return Response.json(
        { error: 'Username atau email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user baru
    const result = await query(
      'INSERT INTO users (username, email, password, role, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id_user',
      [username, email, hashedPassword, role, 'Aktif']
    );

    const newUserId = result[0].id_user;

    return Response.json({
      success: true,
      message: 'User berhasil dibuat',
      data: {
        id: newUserId,
        username,
        email,
        role,
        status: 'Aktif',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Gagal membuat pengguna: ' + error.message },
      { status: 500 }
    );
  }
}
