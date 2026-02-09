'use client';

export default function AttackAnalysis({ result, isLoading, error }) {
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">❌</span>
          <h3 className="text-xl font-bold text-red-600">Error Analisis</h3>
        </div>
        <p className="text-gray-700 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Hasil Analisis ML
        </h3>
        <p className="text-sm text-gray-600 mt-1">Deteksi ancaman berbasis Machine Learning</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-2xl">🔍</div>
              </div>
            </div>
            <span className="mt-4 text-gray-600 font-medium">Menganalisis log dengan AI...</span>
            <span className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</span>
          </div>
        ) : result ? (
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-l-4 border-blue-600 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📊</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">Ringkasan Analisis</p>
                  <p className="text-gray-800 font-medium leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Threats Section */}
            {result.threats && result.threats.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <span>⚠️</span>
                    Ancaman Terdeteksi
                  </h4>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                    {result.threats.length} Threats
                  </span>
                </div>
                <div className="space-y-3">
                  {result.threats.map((threat, idx) => {
                    const icons = {
                      'SQL Injection': '💉',
                      'XSS Attack': '🔓',
                      'DDoS Attack': '🌊',
                      'Malware': '🦠',
                      'Unauthorized Access': '🚫',
                    };
                    const icon = icons[threat.type] || '⚠️';

                    return (
                      <div key={idx} className="bg-red-50 rounded-xl p-4 border-l-4 border-red-600 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">{icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-red-700 text-lg">{threat.type}</p>
                              <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                                #{idx + 1}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{threat.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-600 text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-green-700 font-bold text-lg">Tidak Ada Ancaman Terdeteksi</p>
                <p className="text-green-600 text-sm mt-1">Semua log yang dianalisis dalam kondisi normal</p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.threats?.length || 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Threats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{result.overallThreatLevel}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result.threats?.length > 0 ? '🔴' : '🟢'}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg font-medium mb-2">Belum Ada Analisis</p>
            <p className="text-gray-400 text-sm">Mulai streaming log untuk memulai analisis otomatis</p>
          </div>
        )}
      </div>
    </div>
  );
}
