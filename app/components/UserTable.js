'use client';

import { useState } from 'react';

export default function UserTable({ users, onEdit, onResetPassword, onDelete }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700';
      case 'admin':
        return 'bg-blue-900/30 text-blue-400 border border-blue-700';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return '🔱 Super Admin';
      case 'admin':
        return '👤 Admin';
      default:
        return role;
    }
  };

  const getStatusColor = (status) => {
    return status === 'active'
      ? 'text-green-400'
      : 'text-red-400';
  };

  return (
    <div className="border border-slate-600 rounded-lg bg-slate-950 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Profil Pengguna</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Nama Lengkap</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Peran</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">Login Terakhir</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className={`border-b border-slate-700 transition ${
                  idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/50'
                } hover:bg-slate-800`}
              >
                {/* User Profile */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Full Name */}
                <td className="px-6 py-4 text-slate-300 text-sm">{user.fullName}</td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded ${getRoleBadgeStyle(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></span>
                    <span className={`text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                    </span>
                  </div>
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 text-xs text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-300">{user.lastLogin}</p>
                    <p className="text-slate-500">{user.lastLoginIP}</p>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-2 text-xs font-semibold bg-blue-600/10 text-blue-400 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                      title="Edit pengguna"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onResetPassword(user.id, user.username)}
                      className="px-3 py-2 text-xs font-semibold bg-amber-600/10 text-amber-400 border border-amber-600 rounded hover:bg-amber-600 hover:text-white transition"
                      title="Reset sandi"
                    >
                      🔑 Reset
                    </button>
                    <button
                      onClick={() => onDelete(user.id, user.username)}
                      className="px-3 py-2 text-xs font-semibold bg-red-600/10 text-red-400 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                      title="Hapus pengguna"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">Tidak ada pengguna yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
