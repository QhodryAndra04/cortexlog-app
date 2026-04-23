import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * Service untuk mengelola data pengguna (CRUD).
 */

export async function getAllUsers() {
  return await query(
    'SELECT id_user, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
  );
}

export async function getUserById(id) {
  const users = await query(
    'SELECT id_user, username, email, role, status, created_at FROM users WHERE id_user = $1',
    [id]
  );
  return users[0] || null;
}

export async function createUser({ username, email, password, role }) {
  // Cek duplikasi
  const existingUsers = await query(
    'SELECT id_user FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );

  if (existingUsers.length > 0) {
    throw new Error('Username atau email sudah terdaftar');
  }

  const hashedPassword = await hashPassword(password);

  const result = await query(
    'INSERT INTO users (username, email, password, role, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id_user',
    [username, email, hashedPassword, role, 'Aktif']
  );

  return { id: result[0].id_user, username, email, role, status: 'Aktif' };
}

export async function updateUser(id, data) {
  const { email, role, status, password } = data;
  
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (email) {
    updates.push(`email = $${paramCount++}`);
    values.push(email);
  }

  if (role) {
    if (!['super_admin', 'admin'].includes(role)) throw new Error('Role tidak valid');
    updates.push(`role = $${paramCount++}`);
    values.push(role);
  }

  if (status) {
    if (!['Aktif', 'Nonaktif'].includes(status)) throw new Error('Status tidak valid');
    updates.push(`status = $${paramCount++}`);
    values.push(status);
  }

  if (password) {
    const hashedPassword = await hashPassword(password);
    updates.push(`password = $${paramCount++}`);
    values.push(hashedPassword);
  }

  if (updates.length === 0) return false;

  values.push(id);
  const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id_user = $${paramCount}`;
  await query(updateQuery, values);
  return true;
}

export async function deleteUser(id) {
  const result = await query('DELETE FROM users WHERE id_user = $1', [id]);
  return result;
}
