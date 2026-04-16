"use client";

import { useState, useEffect } from "react";
import UserSummaryCards from "../components/UserSummaryCards";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import TelegramSettings from "../components/TelegramSettings";

export default function UserManagementPage() {
  const [showTelegram, setShowTelegram] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    isEditing: false,
    user: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
    username: "",
  });
  const [resetDialog, setResetDialog] = useState({
    isOpen: false,
    userId: null,
    username: "",
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const result = await response.json();

      if (result.success) {
        // Transform API data to match UI format
        const transformedUsers = result.data.map((user) => ({
        id: user.id_user,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status === 'Aktif' ? 'active' : 'suspended',
      }));
        setUsers(transformedUsers);
      }
      setError(null);
    } catch (err) {
      setError("Gagal mengambil data pengguna");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeSessions: users.filter((u) => u.status === "active").length,
    rolesDistribution: {
      superAdmin: users.filter((u) => u.role === "super_admin").length,
      admin: users.filter((u) => u.role === "admin").length,
    },
  };

  // Handlers
  const handleCreateUser = () => {
    setFormModal({ isOpen: true, isEditing: false, user: null });
  };

  const handleEditUser = (user) => {
    setFormModal({ isOpen: true, isEditing: true, user });
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formModal.isEditing) {
        // Update user via API
        const response = await fetch(`/api/users/${formModal.user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            status: formData.accountSuspended ? 'Nonaktif' : 'Aktif',
            ...(formData.password && { password: formData.password }),
          }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      } else {
        // Create new user via API
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      }
      await fetchUsers(); // Refresh user list
      setFormModal({ isOpen: false, isEditing: false, user: null });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteClick = (userId, username) => {
    setDeleteDialog({ isOpen: true, userId, username });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/users/${deleteDialog.userId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      await fetchUsers(); // Refresh user list
      setDeleteDialog({ isOpen: false, userId: null, username: "" });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleResetPassword = (userId, username) => {
    setResetDialog({ isOpen: true, userId, username });
  };

  const handleConfirmReset = () => {
    setToast({ type: 'success', message: `Tautan reset sandi telah dikirim ke ${resetDialog.username}` });
    setResetDialog({ isOpen: false, userId: null, username: "" });
  };

  return (
    <div className="bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg" role="alert">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-slate-400">Memuat data pengguna...</div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Manajemen Pengguna
                </h1>
                <p className="text-slate-400">
                  Panel kontrol administratif untuk akun pengguna dan kontrol
                  akses berbasis peran
                </p>
              </div>
              <button
                onClick={() => setShowTelegram(true)}
                className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Manajemen Telegram
              </button>
            </div>

            {/* Summary Stats */}
            <UserSummaryCards
              totalUsers={stats.totalUsers}
              activeSessions={stats.activeSessions}
              rolesDistribution={stats.rolesDistribution}
            />

            {/* Action Bar */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 w-full md:w-auto">
                <label htmlFor="user-search" className="sr-only">Cari pengguna</label>
                <input
                  id="user-search"
                  type="text"
                  placeholder="Cari berdasarkan nama, email, nama pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                />
              </div>

              {/* Filter */}
              <div>
                <label htmlFor="role-filter" className="sr-only">Filter peran</label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                >
                  <option value="all">Semua Peran</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateUser}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Buat Pengguna Baru
              </button>
            </div>

            {/* User Table */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">
                Pengguna Terdaftar ({filteredUsers.length})
              </h2>
              <UserTable
                users={filteredUsers}
                onEdit={handleEditUser}
                onResetPassword={handleResetPassword}
                onDelete={handleDeleteClick}
              />
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={formModal.isOpen}
        isEditing={formModal.isEditing}
        user={formModal.user}
        onSubmit={handleFormSubmit}
        onCancel={() =>
          setFormModal({ isOpen: false, isEditing: false, user: null })
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${deleteDialog.username}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteDialog({ isOpen: false, userId: null, username: "" })
        }
        isDanger={true}
      />

      {/* Reset Password Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={resetDialog.isOpen}
        title="Reset Sandi"
        message={`Kirim tautan reset sandi ke "${resetDialog.username}"? Mereka akan menerima email dengan instruksi.`}
        onConfirm={handleConfirmReset}
        onCancel={() =>
          setResetDialog({ isOpen: false, userId: null, username: "" })
        }
        isDanger={false}
      />

      {/* Telegram Settings Modal */}
      {showTelegram && (
        <div>
          <TelegramSettings onClose={() => setShowTelegram(false)} />
          <button
            onClick={() => setShowTelegram(false)}
            className="fixed inset-0 z-40"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'error'
              ? 'bg-red-900/90 border-red-700 text-red-200'
              : 'bg-green-900/90 border-green-700 text-green-200'
          }`}
          role="alert"
          aria-live="polite"
        >
          {toast.type === 'error' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-current opacity-70 hover:opacity-100 transition"
            aria-label="Tutup notifikasi"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
