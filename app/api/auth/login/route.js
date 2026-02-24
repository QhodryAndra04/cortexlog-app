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
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return Response.json(
        { error: 'Gagal terhubung ke database. Pastikan MySQL sudah running dan database sudah dibuat.' },
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
    const token = generateToken(user.id, user.email, user.username);

    // Return success response
    return Response.json(
      {
        message: 'Login berhasil',
        token: token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullname: user.fullname,
          role: user.role,
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
