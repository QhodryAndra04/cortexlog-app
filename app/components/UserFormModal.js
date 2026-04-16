"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function UserFormModal({
  isOpen,
  isEditing,
  user,
  onSubmit,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "admin",
    password: "",
    confirmPassword: "",
    requirePasswordChange: true,
    accountSuspended: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        password: "",
        confirmPassword: "",
        requirePasswordChange: false,
        accountSuspended: user.status === "suspended",
      });
      setErrors({});
    } else {
      setFormData({
        username: "",
        email: "",
        role: "admin",
        password: "",
        confirmPassword: "",
        requirePasswordChange: true,
        accountSuspended: false,
      });
      setErrors({});
    }
  }, [isOpen, isEditing, user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Nama pengguna wajib diisi";
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Email yang valid wajib diisi";
    }
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = "Sandi wajib diisi";
      } else if (formData.password.length < 8) {
        newErrors.password = "Sandi minimal 8 karakter";
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Sandi tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const cancelRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelRef.current) {
      cancelRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap: Escape to close + Tab cycling within modal
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isOpen, onCancel],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onCancel}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <div
          ref={dialogRef}
          className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 id="user-form-title" className="text-xl font-bold text-white">
              {isEditing
                ? `Edit Pengguna: ${user?.username}`
                : "Buat Pengguna Baru"}
            </h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white p-2 rounded-lg transition"
              aria-label="Tutup formulir"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
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
                  <label
                    htmlFor="user-username"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Nama Pengguna
                  </label>
                  <input
                    id="user-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isEditing}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 disabled:opacity-50 transition"
                    placeholder="Masukkan nama pengguna"
                    autoComplete="username"
                  />
                  {errors.username && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="user-email"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Alamat Email
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    placeholder="user@example.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role Selection Section - Updated with new schema */}
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
                    checked={formData.role === "super_admin"}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-yellow-400 font-semibold inline-flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Super Admin
                    </span>
                    <p className="text-slate-500 text-xs">
                      Akses sistem penuh & manajemen pengguna
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-blue-400 font-semibold inline-flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Admin
                    </span>
                    <p className="text-slate-500 text-xs">
                      Akses dashboard & konfigurasi
                    </p>
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
                  <label
                    htmlFor="user-password"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Sandi{" "}
                    {!isEditing && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    id="user-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    placeholder={
                      isEditing
                        ? "Biarkan kosong untuk tetap sekarang"
                        : "Masukkan sandi"
                    }
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="user-confirm-password"
                    className="block text-sm font-semibold text-slate-300 mb-2"
                  >
                    Konfirmasi Sandi{" "}
                    {!isEditing && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    id="user-confirm-password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition"
                    placeholder="Konfirmasi sandi"
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
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
                  <span className="text-slate-300 text-sm">
                    Wajibkan perubahan sandi pada login berikutnya
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accountSuspended"
                    checked={formData.accountSuspended}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-red-400 text-sm font-semibold inline-flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Suspend Akun
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                ref={cancelRef}
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                {isEditing ? "Perbarui Pengguna" : "Buat Pengguna"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
