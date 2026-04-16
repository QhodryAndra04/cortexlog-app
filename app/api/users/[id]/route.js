'use server';

import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (id) {
      // Get single user
      const users = await query(
        'SELECT id_user, username, email, role, status, created_at FROM users WHERE id_user = $1',
        [id]
      );

      if (!users || users.length === 0) {
        return Response.json(
          { error: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        data: users[0],
      });
    } else {
      // Get all users
      const users = await query(
        'SELECT id_user, username, email, role, status, created_at FROM users ORDER BY created_at DESC'
      );

      return Response.json({
        success: true,
        data: users,
        total: users.length,
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Gagal mengambil data pengguna' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { email, role, status, password } = await request.json();

    // Validasi input
    if (!id) {
      return Response.json(
        { error: 'ID user harus disediakan' },
        { status: 400 }
      );
    }

    // Cek user exists
    const users = await query('SELECT id_user FROM users WHERE id_user = $1', [id]);
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (role) {
      // Validasi role
      if (!['super_admin', 'admin'].includes(role)) {
        return Response.json(
          { error: 'Role harus super_admin atau admin' },
          { status: 400 }
        );
      }
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (status) {
      // Validasi status
      if (!['Aktif', 'Nonaktif'].includes(status)) {
        return Response.json(
          { error: 'Status harus Aktif atau Nonaktif' },
          { status: 400 }
        );
      }
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    // If no updates, return error
    if (updates.length === 0) {
      return Response.json(
        { error: 'Tidak ada field yang diupdate' },
        { status: 400 }
      );
    }

    // Add id to values
    values.push(id);

    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id_user = $${paramCount}`;
    await query(updateQuery, values);

    return Response.json({
      success: true,
      message: 'User berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Gagal memperbarui pengguna: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: 'ID user harus disediakan' },
        { status: 400 }
      );
    }

    // Cek user exists
    const users = await query('SELECT id_user FROM users WHERE id_user = $1', [id]);
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete user
    await query('DELETE FROM users WHERE id_user = $1', [id]);

    return Response.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json(
      { error: 'Gagal menghapus pengguna: ' + error.message },
      { status: 500 }
    );
  }
}

