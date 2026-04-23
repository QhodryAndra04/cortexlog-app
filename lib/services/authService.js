import { query } from '@/lib/db';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';

/**
 * Service untuk autentikasi (Login & Register).
 */

export async function loginUser(username, password) {
  const users = await query(
    'SELECT id_user, username, email, password, role, status FROM users WHERE username = $1',
    [username]
  );

  if (!users || users.length === 0) {
    throw new Error('Username atau password salah');
  }

  const user = users[0];
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Username atau password salah');
  }

  const token = generateToken(user.id_user, user.email, user.username);

  return {
    token,
    user: {
      id: user.id_user,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    }
  };
}

export async function registerUser({ username, email, password, role = 'admin' }) {
  // Cek duplikasi
  const existingRecords = await query(
    'SELECT id_user FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );

  if (existingRecords.length > 0) {
    throw new Error('Username atau email sudah digunakan');
  }

  const hashedPassword = await hashPassword(password);

  const result = await query(
    'INSERT INTO users (username, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id_user',
    [username, email, hashedPassword, role, 'Aktif']
  );

  return { id: result[0].id_user, username, email, role };
}
