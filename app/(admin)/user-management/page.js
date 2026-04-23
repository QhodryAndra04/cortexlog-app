"use client";

import { useState, useEffect } from "react";
import UserSummaryCards from "@/app/components/UserSummaryCards";
import UserTable from "@/app/components/UserTable";
import UserFormModal from "@/app/components/UserFormModal";
import { showSuccess, showError, confirmAction } from "@/lib/swal";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    isEditing: false,
    user: null,
  });

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
        const transformedUsers = result.data.map((user) => ({
          id: user.id_user,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name || user.username, // Use full_name if available
          status: user.status === 'Aktif' ? 'active' : 'suspended',
        }));
        setUsers(transformedUsers);
      }
      setError(null);
    } catch (err) {
      showError("Gagal Mengambil Data", "Terjadi kesalahan saat memuat daftar pengguna.");
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

  const stats = {
    totalUsers: users.length,
    activeSessions: users.filter((u) => u.status === "active").length,
    rolesDistribution: {
      superAdmin: users.filter((u) => u.role === "super_admin").length,
      admin: users.filter((u) => u.role === "admin").length,
    },
  };

  const handleCreateUser = () => {
    setFormModal({ isOpen: true, isEditing: false, user: null });
  };

  const handleEditUser = (user) => {
    setFormModal({ isOpen: true, isEditing: true, user });
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formModal.isEditing) {
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
        if (!response.ok) throw new Error("Gagal menyimpan perubahan");
        showSuccess("Profil pengguna diperbarui");
      }
      await fetchUsers();
      setFormModal({ isOpen: false, isEditing: false, user: null });
    } catch (err) {
      showError("Gagal Menyimpan", err.message);
    }
  };

  const handleDeleteClick = async (userId, username) => {
    const confirmed = await confirmAction(
      "Hapus Pengguna?",
      `Anda akan menghapus "${username}". Tindakan ini tidak dapat dibatalkan!`,
      "Ya, Hapus"
    );
    
    if (confirmed) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);

        showSuccess(`Pengguna ${username} telah dihapus`);
        await fetchUsers();
      } catch (err) {
        showError("Gagal Menghapus", err.message);
      }
    }
  };

  const handleResetPassword = async (userId, username) => {
    const confirmed = await confirmAction(
      "Reset Kata Sandi?",
      `Kirim tautan reset sandi ke "${username}"?`,
      "Ya, Kirim"
    );

    if (confirmed) {
      showSuccess(`Tautan reset sandi telah dikirim ke ${username}`);
    }
  };

  return (
    <div className="bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg" role="alert">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-slate-400">Memuat data pengguna...</div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Manajemen Pengguna
              </h1>
              <p className="text-slate-400">
                Panel kontrol administratif untuk akun pengguna dan kontrol akses berbasis peran
              </p>
            </div>

            <UserSummaryCards
              totalUsers={stats.totalUsers}
              activeSessions={stats.activeSessions}
              rolesDistribution={stats.rolesDistribution}
            />

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
              <div className="flex-1 w-full md:w-auto">
                <input
                  id="user-search"
                  type="text"
                  placeholder="Cari berdasarkan nama, email, nama pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition"
                >
                  <option value="all">Semua Peran</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  onClick={handleCreateUser}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 text-sm whitespace-nowrap inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Buat Pengguna Baru
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Pengguna Terdaftar <span className="text-slate-500 text-sm font-medium ml-2">({filteredUsers.length})</span>
                </h2>
              </div>
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

      <UserFormModal
        isOpen={formModal.isOpen}
        isEditing={formModal.isEditing}
        user={formModal.user}
        onSubmit={handleFormSubmit}
        onCancel={() =>
          setFormModal({ isOpen: false, isEditing: false, user: null })
        }
      />
    </div>
  );
}
