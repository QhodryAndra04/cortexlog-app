import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (id) {
      // Get single user
      const users = await query(
        'SELECT id, username, email, fullname, role, is_active, created_at, updated_at FROM users WHERE id = ?',
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
        'SELECT id, username, email, fullname, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
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
    const { email, fullname, role, is_active, password } = await request.json();

    // Validasi input
    if (!id) {
      return Response.json(
        { error: 'ID user harus disediakan' },
        { status: 400 }
      );
    }

    // Cek user exists
    const users = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update user
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const values = [];

    if (email) {
      updateQuery += ', email = ?';
      values.push(email);
    }
    if (fullname) {
      updateQuery += ', fullname = ?';
      values.push(fullname);
    }
    if (role) {
      updateQuery += ', role = ?';
      values.push(role);
    }
    if (is_active !== undefined) {
      updateQuery += ', is_active = ?';
      values.push(is_active ? 1 : 0);
    }
    if (password) {
      const hashedPassword = await hashPassword(password);
      updateQuery += ', password = ?';
      values.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    values.push(id);

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
    const users = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [id]);

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

