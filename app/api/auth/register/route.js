/**
 * POST /api/auth/register
 */

import { registerUser } from '@/lib/services/authService';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return Response.json({ error: 'Username, email, dan password harus diisi' }, { status: 400 });
    }

    const newUser = await registerUser({ username, email, password });
    
    // Generate token untuk auto-login setelah register
    const token = generateToken(newUser.id, newUser.email, newUser.username);

    return Response.json({
      message: 'Register berhasil',
      token,
      user: {
        ...newUser,
        status: 'Aktif'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error.message);
    return Response.json({ 
        error: error.message === 'Username atau email sudah digunakan' 
            ? error.message 
            : 'Terjadi kesalahan sistem'
    }, { status: 409 });
  }
}
