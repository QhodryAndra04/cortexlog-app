import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password, fullname } = await request.json();

    // Validasi input
    if (!username || !email || !password || !fullname) {
      return Response.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah terdaftar
    const existingUsers = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
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

    // Insert user baru ke database
    const result = await query(
      'INSERT INTO users (username, email, password, fullname, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [username, email, hashedPassword, fullname, 'admin']
    );

    // Generate token
    const token = generateToken(result.insertId, email, username);

    return Response.json(
      {
        message: 'Register berhasil',
        token: token,
        user: {
          id: result.insertId,
          username: username,
          email: email,
          fullname: fullname,
          role: 'admin',
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
