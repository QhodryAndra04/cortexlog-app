'use server';

import { query } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      return Response.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    console.log('Login attempt for username:', username);

    // Cari user berdasarkan username
    let users;
    try {
      users = await query(
        'SELECT id_user, username, email, password, role, status, created_at FROM users WHERE username = $1',
        [username]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return Response.json(
        { error: 'Gagal terhubung ke database. Pastikan PostgreSQL sudah running dan database sudah dibuat.' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return Response.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Validasi password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id_user, user.email, user.username);

    // Return success response
    return Response.json(
      {
        message: 'Login berhasil',
        token: token,
        user: {
          id: user.id_user,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan pada server: ' + error.message },
      { status: 500 }
    );
  }
}
