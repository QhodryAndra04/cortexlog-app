'use client';

export default function StatCard({ title, value, icon, trend, trendValue, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    red: "from-red-500 to-red-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  const textColorClasses = {
    blue: "text-blue-400",
    red: "text-red-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
  };

  const borderColorClasses = {
    blue: "border-blue-600 hover:border-blue-500",
    red: "border-red-600 hover:border-red-500",
    green: "border-green-600 hover:border-green-500",
    yellow: "border-yellow-600 hover:border-yellow-500",
    purple: "border-purple-600 hover:border-purple-500",
  };

  const trendIcon = (dir) => {
    switch (dir) {
      case 'up':
        return (<svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" /></svg>);
      case 'down':
        return (<svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" /></svg>);
      default:
        return (<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>);
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border ${borderColorClasses[color]} p-6 hover:shadow-2xl transition-shadow`}
      role="group"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{title}</p>
          <p className={`text-4xl font-bold ${textColorClasses[color]} mt-3 mb-2`}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              {trendIcon(trend)}
              <span className={`text-sm font-medium ${
                trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-slate-400"
              }`}>
                {trendValue}
              </span>
              <span className="text-xs text-slate-500">vs kemarin</span>
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-xl p-4 shadow-lg`} aria-hidden="true">
          <div className="text-3xl">{icon}</div>
        </div>
      </div>
    </div>
  );
}
