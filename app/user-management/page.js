"use client";

import { useState } from "react";
import UserSummaryCards from "../components/UserSummaryCards";
import UserTable from "../components/UserTable";
import UserFormModal from "../components/UserFormModal";
import ConfirmationDialog from "../components/ConfirmationDialog";
import TelegramSettings from "../components/TelegramSettings";

export default function UserManagementPage() {
  const [showTelegram, setShowTelegram] = useState(false);
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "admin_super",
      email: "super.admin@cortexlog.id",
      fullName: "Budi Santoso, S.Kom",
      role: "super_admin",
      status: "active",
      lastLogin: "2024-02-20 14:30",
      lastLoginIP: "192.168.1.100",
    },
  ]);

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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase());

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
      analyst: users.filter((u) => u.role === "analyst").length,
    },
  };

  // Handlers
  const handleCreateUser = () => {
    setFormModal({ isOpen: true, isEditing: false, user: null });
  };

  const handleEditUser = (user) => {
    setFormModal({ isOpen: true, isEditing: true, user });
  };

  const handleFormSubmit = (formData) => {
    if (formModal.isEditing) {
      // Update user
      setUsers(
        users.map((u) =>
          u.id === formModal.user.id
            ? {
                ...u,
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                status: formData.accountSuspended ? "suspended" : "active",
              }
            : u,
        ),
      );
    } else {
      // Create new user
      const newUser = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        status: formData.accountSuspended ? "suspended" : "active",
        lastLogin: "Never",
        lastLoginIP: "—",
      };
      setUsers([...users, newUser]);
    }
    setFormModal({ isOpen: false, isEditing: false, user: null });
  };

  const handleDeleteClick = (userId, username) => {
    setDeleteDialog({ isOpen: true, userId, username });
  };

  const handleConfirmDelete = () => {
    setUsers(users.filter((u) => u.id !== deleteDialog.userId));
    setDeleteDialog({ isOpen: false, userId: null, username: "" });
  };

  const handleResetPassword = (userId, username) => {
    setResetDialog({ isOpen: true, userId, username });
  };

  const handleConfirmReset = () => {
    alert(`Tautan reset sandi telah dikirim ke ${resetDialog.username}`);
    setResetDialog({ isOpen: false, userId: null, username: "" });
  };

  return (
    <div className="bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manajemen Pengguna
            </h1>
            <p className="text-slate-400">
              Panel kontrol administratif untuk akun pengguna dan kontrol akses
              berbasis peran
            </p>
          </div>
          <button
            onClick={() => setShowTelegram(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition text-sm whitespace-nowrap"
          >
            📋 Manajemen Telegram
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
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, nama pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="all">Semua Peran</option>
            <option value="super_admin">🔱 Super Admin</option>
            <option value="admin">👤 Admin</option>
          </select>

          {/* Create Button */}
          <button
            onClick={handleCreateUser}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition text-sm whitespace-nowrap"
          >
            + BUAT PENGGUNA BARU
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
    </div>
  );
}
