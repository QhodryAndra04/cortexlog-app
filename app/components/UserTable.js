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
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return (<svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
      case 'admin':
        return (<svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
      default:
        return null;
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
        <table className="w-full text-sm" role="table">
          <caption className="sr-only">Daftar pengguna terdaftar</caption>
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th scope="col" className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-slate-500">Profil Pengguna</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-slate-500">Nama Lengkap</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-slate-500">Peran</th>
              <th scope="col" className="px-6 py-4 text-center text-[10px] uppercase tracking-widest font-bold text-slate-500">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold text-slate-500">Login Terakhir</th>
              <th scope="col" className="px-6 py-4 text-center text-[10px] uppercase tracking-widest font-bold text-slate-500">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map((user, idx) => (
              <tr
                key={user.id}
                className="hover:bg-slate-900/40 transition-colors group"
              >
                {/* User Profile */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-900/20"
                      aria-hidden="true"
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{user.username}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{user.email}</span>
                    </div>
                  </div>
                </td>

                {/* Full Name */}
                <td className="px-6 py-4 align-middle">
                  <span className="text-sm text-slate-300 font-medium">{user.fullName || "-"}</span>
                </td>

                {/* Role */}
                <td className="px-6 py-4 align-middle">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 uppercase tracking-wide ${getRoleBadgeStyle(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} aria-hidden="true"></div>
                    <span className={`text-[11px] font-bold uppercase tracking-tight ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-300 font-medium">{user.lastLogin || "Belum Pernah"}</span>
                    <span className="text-[10px] text-slate-500 font-mono tracking-tight">{user.lastLoginIP}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 align-middle">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all border border-transparent hover:border-blue-400/30"
                      title="Edit Pengguna"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => onResetPassword(user.id, user.username)}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all border border-transparent hover:border-amber-400/30"
                      title="Reset Password"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </button>
                    <button
                      onClick={() => onDelete(user.id, user.username)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/30"
                      title="Hapus Pengguna"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <p className="text-slate-400">Tidak ada pengguna yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
