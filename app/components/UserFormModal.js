'use client';

import { useState, useEffect } from 'react';

export default function UserFormModal({ isOpen, isEditing, user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'admin',
    password: '',
    confirmPassword: '',
    requirePasswordChange: true,
    accountSuspended: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        password: '',
        confirmPassword: '',
        requirePasswordChange: false,
        accountSuspended: user.status === 'suspended',
      });
      setErrors({});
    } else {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'admin',
        password: '',
        confirmPassword: '',
        requirePasswordChange: true,
        accountSuspended: false,
      });
      setErrors({});
    }
  }, [isOpen, isEditing, user]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nama pengguna wajib diisi';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Email yang valid wajib diisi';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Sandi wajib diisi';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Sandi minimal 8 karakter';
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Sandi tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? `Edit Pengguna: ${user?.username}` : 'Buat Pengguna Baru'}
            </h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Account Details Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-700">
                Detail Akun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nama Pengguna
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isEditing}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="Masukkan nama pengguna"
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500"
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Full Name */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Budi Santoso, S.Kom"
                />
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
              </div>
            </div>

            {/* Role Selection Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-700">
                Penugasan Peran
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="super_admin"
                    checked={formData.role === 'super_admin'}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-yellow-400 font-semibold">🔱 Super Admin</span>
                    <p className="text-slate-500 text-xs">Akses sistem penuh & manajemen pengguna</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-blue-400 font-semibold">👤 Admin</span>
                    <p className="text-slate-500 text-xs">Akses dashboard & konfigurasi</p>
                  </div>
                </label>


              </div>
            </div>

            {/* Security Settings Section */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-700">
                Pengaturan Keamanan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Sandi {!isEditing && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500"
                    placeholder={isEditing ? 'Biarkan kosong untuk tetap sekarang' : 'Masukkan sandi'}
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Konfirmasi Sandi {!isEditing && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500"
                    placeholder="Konfirmasi sandi"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requirePasswordChange"
                    checked={formData.requirePasswordChange}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-300 text-sm">Wajibkan perubahan sandi pada login berikutnya</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accountSuspended"
                    checked={formData.accountSuspended}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-red-400 text-sm font-semibold">🔒 Suspend Akun</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-600 rounded hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                {isEditing ? 'Perbarui Pengguna' : 'Buat Pengguna'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
