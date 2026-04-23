/**
 * POST /api/auth/login
 */

import { loginUser } from '@/lib/services/authService';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
        return Response.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const data = await loginUser(username, password);

    return Response.json({
      message: 'Login berhasil',
      ...data
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error.message);
    return Response.json({ 
        error: error.message === 'Username atau password salah' 
            ? error.message 
            : 'Terjadi kesalahan sistem'
    }, { status: 401 });
  }
}
