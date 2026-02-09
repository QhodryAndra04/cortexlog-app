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
            <p className="text-slate-400 text-sm font-medium">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
            <p className="text-slate-500 text-xs mt-2">Registered accounts</p>
          </div>
          <div className="text-4xl">👥</div>
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="border border-slate-600 rounded-lg bg-slate-950 p-6 hover:border-slate-500 transition">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              Active Sessions
            </p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {activeSessions}
            </p>
            <p className="text-slate-500 text-xs mt-2">Online now</p>
          </div>
          <div className="text-4xl">🟢</div>
        </div>
      </div>

      {/* Roles Distribution Card */}
      <div className="border border-slate-600 rounded-lg bg-slate-950 p-6 hover:border-slate-500 transition">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-slate-400 text-sm font-medium">
              Roles Distribution
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400">🔱 Super Admin:</span>
                <span className="text-white font-semibold">
                  {rolesDistribution.superAdmin}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-400">👤 Admin:</span>
                <span className="text-white font-semibold">
                  {rolesDistribution.admin}
                </span>
              </div>
            </div>
          </div>
          <div className="text-4xl">📋</div>
        </div>
      </div>
    </div>
  );
}
