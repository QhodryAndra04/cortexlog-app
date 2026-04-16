'use server';

import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Validasi input
    if (!username || !email || !password) {
      return Response.json(
        { error: 'Username, email, dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah terdaftar
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

    // Insert user baru ke database sebagai admin
    const result = await query(
      'INSERT INTO users (username, email, password, role, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id_user',
      [username, email, hashedPassword, 'admin', 'Aktif']
    );

    const newUserId = result[0].id_user;

    // Generate token
    const token = generateToken(newUserId, email, username);

    return Response.json(
      {
        message: 'Register berhasil',
        token: token,
        user: {
          id: newUserId,
          username: username,
          email: email,
          role: 'admin',
          status: 'Aktif',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
