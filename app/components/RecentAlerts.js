'use client';

export default function RecentAlerts({ alerts }) {
  const getSeverityColor = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sql') || lowerType.includes('xss') || lowerType.includes('ddos')) {
      return 'border-l-red-500 bg-red-900/20';
    }
    if (lowerType.includes('unauthorized') || lowerType.includes('malware')) {
      return 'border-l-orange-500 bg-orange-900/20';
    }
    return 'border-l-yellow-500 bg-yellow-900/20';
  };

  const getSeverityIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sql') || lowerType.includes('injection')) {
      return (<svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>);
    }
    if (lowerType.includes('xss')) {
      return (<svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
    }
    if (lowerType.includes('ddos') || lowerType.includes('dos')) {
      return (<svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
    }
    if (lowerType.includes('malware')) {
      return (<svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);
    }
    if (lowerType.includes('unauthorized') || lowerType.includes('brute')) {
      return (<svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>);
    }
    return (<svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);
  };

  const getAttackTypeBadge = (attackType) => {
    const typeColors = {
      'SQL Injection': 'bg-red-600/30 text-red-300 border border-red-600/50',
      'XSS': 'bg-orange-600/30 text-orange-300 border border-orange-600/50',
      'DoS': 'bg-red-700/30 text-red-300 border border-red-700/50',
      'Brute Force': 'bg-yellow-600/30 text-yellow-300 border border-yellow-600/50',
      'Other': 'bg-slate-600/30 text-slate-300 border border-slate-600/50'
    };
    return typeColors[attackType] || 'bg-slate-600/30 text-slate-300 border border-slate-600/50';
  };

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Peringatan Anomali Terbaru
            </h3>
            <p className="text-sm text-slate-400 mt-1">10 anomali terakhir yang terdeteksi</p>
          </div>
          <div className="bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg font-bold text-sm border border-red-600/30" aria-label={`${alerts.length} peringatan`}>
            {alerts.length} Peringatan
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto" role="log" aria-live="polite" aria-label="Daftar peringatan anomali">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-slate-300 text-lg font-medium">Tidak ada anomali terdeteksi</p>
            <p className="text-slate-500 text-sm mt-2">Sistem berjalan normal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-4 p-4 rounded-lg border-l-4 transition-all hover:bg-slate-800/50 ${
                  getSeverityColor(alert.type)
                } ${index === 0 ? 'ring-1 ring-red-500/30' : ''}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-white">{alert.type}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getAttackTypeBadge(alert.attackType)}`}>
                          {alert.attackType}
                        </span>
                        {alert.ip && (
                          <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-600">
                            {alert.ip}
                          </span>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-lg font-bold animate-pulse flex-shrink-0">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{alert.description}</p>
                  
                  {/* Full Apache Log */}
                  {alert.logLine && (
                    <div className="bg-slate-900 text-slate-300 text-xs p-3 rounded-lg font-mono overflow-x-auto border border-slate-700 mb-3">
                      <code className="break-all">{alert.logLine}</code>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(alert.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                      ID: {alert.id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="border-t border-slate-700 p-4">
          <p className="w-full text-center text-slate-500 text-sm">
            Menampilkan {alerts.length} peringatan terbaru
          </p>
        </div>
      )}
    </div>
  );
}
