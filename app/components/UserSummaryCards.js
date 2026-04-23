"use client";

export default function UserSummaryCards({
  totalUsers,
  activeSessions,
  rolesDistribution,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Users Card */}
      <div className="group border border-slate-800 rounded-xl bg-slate-900/40 p-6 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all duration-300 backdrop-blur-sm shadow-xl shadow-black/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-3">Total Pengguna</p>
            <p className="text-4xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">{totalUsers}</p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Akun terdaftar di sistem</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="group border border-slate-800 rounded-xl bg-slate-900/40 p-6 hover:border-green-500/50 hover:bg-slate-900/60 transition-all duration-300 backdrop-blur-sm shadow-xl shadow-black/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-3">Sesi Aktif</p>
            <p className="text-4xl font-bold tracking-tight text-green-400 group-hover:scale-105 transition-transform origin-left">{activeSessions}</p>
            <div className="flex items-center gap-1.5 mt-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">Pengguna sedang daring</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-600/10 border border-green-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Roles Distribution Card */}
      <div className="group border border-slate-800 rounded-xl bg-slate-900/40 p-6 hover:border-purple-500/50 hover:bg-slate-900/60 transition-all duration-300 backdrop-blur-sm shadow-xl shadow-black/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-500 mb-3">Distribusi Peran</p>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-yellow-400/80 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
                  Super Admin
                </span>
                <span className="text-sm font-bold text-white">{rolesDistribution.superAdmin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-400/80 uppercase tracking-wide flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  Admin
                </span>
                <span className="text-sm font-bold text-white">{rolesDistribution.admin}</span>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ml-4" aria-hidden="true">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
