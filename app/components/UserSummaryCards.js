"use client";

export default function UserSummaryCards({
  totalUsers,
  activeSessions,
  rolesDistribution,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Users Card */}
      <div className="border border-slate-600 rounded-lg bg-slate-950 p-6 hover:border-slate-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Pengguna</p>
            <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
            <p className="text-slate-500 text-xs mt-2">Akun terdaftar</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center" aria-hidden="true">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="border border-slate-600 rounded-lg bg-slate-950 p-6 hover:border-slate-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Sesi Aktif</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{activeSessions}</p>
            <p className="text-slate-500 text-xs mt-2">Sedang daring</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center" aria-hidden="true">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Roles Distribution Card */}
      <div className="border border-slate-600 rounded-lg bg-slate-950 p-6 hover:border-slate-500 transition">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-400 text-sm font-medium">Distribusi Peran</p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Super Admin:
                </span>
                <span className="text-white font-semibold">{rolesDistribution.superAdmin}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Admin:
                </span>
                <span className="text-white font-semibold">{rolesDistribution.admin}</span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center" aria-hidden="true">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
