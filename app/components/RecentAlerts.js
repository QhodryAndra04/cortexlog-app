'use client';

export default function RecentAlerts({ alerts }) {
  const getSeverityColor = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sql') || lowerType.includes('xss') || lowerType.includes('ddos')) {
      return 'border-red-600 bg-red-50';
    }
    if (lowerType.includes('unauthorized') || lowerType.includes('malware')) {
      return 'border-orange-600 bg-orange-50';
    }
    return 'border-yellow-600 bg-yellow-50';
  };

  const getSeverityIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sql') || lowerType.includes('injection')) return '💉';
    if (lowerType.includes('xss')) return '🔓';
    if (lowerType.includes('ddos') || lowerType.includes('dos')) return '🌊';
    if (lowerType.includes('malware')) return '🦠';
    if (lowerType.includes('unauthorized') || lowerType.includes('brute')) return '🚫';
    return '⚠️';
  };

  const getAttackTypeBadge = (attackType) => {
    const typeColors = {
      'SQL Injection': 'bg-red-600 text-white font-bold',
      'XSS': 'bg-orange-600 text-white font-bold',
      'DoS': 'bg-red-700 text-white font-bold',
      'Brute Force': 'bg-yellow-600 text-white font-bold',
      'Other': 'bg-gray-600 text-white font-bold'
    };
    return typeColors[attackType] || 'bg-gray-600 text-white font-bold';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              Peringatan Anomali Terbaru
            </h3>
            <p className="text-sm text-gray-600 mt-1">10 anomali terakhir yang terdeteksi</p>
          </div>
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-bold text-sm">
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg font-medium">Tidak ada anomali terdeteksi</p>
            <p className="text-gray-400 text-sm mt-2">Sistem berjalan normal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-4 p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                  getSeverityColor(alert.type)
                } ${index === 0 ? 'ring-2 ring-red-200' : ''}`}
              >
                <div className="text-3xl flex-shrink-0">
                  {getSeverityIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{alert.type}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getAttackTypeBadge(alert.attackType)}`}>
                          {alert.attackType}
                        </span>
                        {alert.ip && (
                          <div className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg font-mono font-bold">
                            <span>🌐</span>
                            <span>{alert.ip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse flex-shrink-0">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{alert.description}</p>
                  
                  {/* Attack Type and Full Log */}
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getAttackTypeBadge(alert.attackType)}`}>
                        {alert.attackType}
                      </span>
                      {alert.ip && (
                        <div className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg font-mono font-bold">
                          <span>🌐</span>
                          <span>{alert.ip}</span>
                        </div>
                      )}
                    </div>
                    {/* Full Apache Log */}
                    {alert.logLine && (
                      <div className="bg-gray-800 text-gray-100 text-xs p-3 rounded-lg font-mono overflow-x-auto border border-gray-700">
                        <code className="break-all">{alert.logLine}</code>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    <span className="flex items-center gap-1">
                      <span>🕐</span>
                      {new Date(alert.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🔍</span>
                      ID: {alert.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
          <button className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition">
            Lihat Semua Peringatan →
          </button>
        </div>
      )}
    </div>
  );
}
