import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get all users
    const users = await query(
      'SELECT id, username, email, fullname, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
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
    const { username, email, password, fullname, role } = await request.json();

    // Validasi input
    if (!username || !email || !password || !fullname || !role) {
      return Response.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah ada
    const existingUsers = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
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
      'INSERT INTO users (username, email, password, fullname, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())',
      [username, email, hashedPassword, fullname, role]
    );

    return Response.json({
      success: true,
      message: 'User berhasil dibuat',
      data: {
        id: result.insertId,
        username,
        email,
        fullname,
        role,
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
