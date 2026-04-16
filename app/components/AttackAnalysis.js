'use client';

// SVG icon components replacing emojis for cross-platform consistency
const AlertTriangleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);
const CpuIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 7h10v10H7V7z" />
  </svg>
);
const ChartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const ShieldCheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const BugIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const XCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const threatIcons = {
  'SQL Injection': BugIcon,
  'XSS Attack': AlertTriangleIcon,
  'DDoS Attack': AlertTriangleIcon,
  'Malware': BugIcon,
  'Unauthorized Access': XCircleIcon,
};

export default function AttackAnalysis({ result, isLoading, error }) {
  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-red-700/50 p-6 border-l-4 border-l-red-600">
        <div className="flex items-center gap-3 mb-2">
          <XCircleIcon className="w-7 h-7 text-red-500" />
          <h3 className="text-xl font-bold text-red-400">Error Analisis</h3>
        </div>
        <p className="text-slate-300 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-700 p-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <CpuIcon className="w-6 h-6 text-blue-400" />
          Hasil Analisis ML
        </h3>
        <p className="text-sm text-slate-400 mt-1">Deteksi ancaman berbasis Machine Learning</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <SearchIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <span className="mt-4 text-slate-300 font-medium">Menganalisis log dengan AI...</span>
            <span className="text-sm text-slate-500 mt-1">Mohon tunggu sebentar</span>
          </div>
        ) : result ? (
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="bg-blue-950/40 rounded-xl p-5 border-l-4 border-l-blue-500 border border-blue-800/30">
              <div className="flex items-start gap-3">
                <ChartIcon className="w-7 h-7 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-1">Ringkasan Analisis</p>
                  <p className="text-slate-200 font-medium leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Threats Section */}
            {result.threats && result.threats.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />
                    Ancaman Terdeteksi
                  </h4>
                  <span className="bg-red-900/50 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-700/50">
                    {result.threats.length} Ancaman
                  </span>
                </div>
                <div className="space-y-3">
                  {result.threats.map((threat, idx) => {
                    const IconComp = threatIcons[threat.type] || AlertTriangleIcon;

                    return (
                      <div key={idx} className="bg-red-950/30 rounded-xl p-4 border-l-4 border-l-red-600 border border-red-800/30 hover:bg-red-950/50 transition-all">
                        <div className="flex items-start gap-3">
                          <IconComp className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-red-400 text-lg">{threat.type}</p>
                              <span className="bg-red-900/60 text-red-300 px-2 py-1 rounded-full text-xs font-bold border border-red-700/50">
                                #{idx + 1}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{threat.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-green-950/30 rounded-xl p-6 border-l-4 border-l-green-600 border border-green-800/30 text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-400 font-bold text-lg">Tidak Ada Ancaman Terdeteksi</p>
                <p className="text-green-500/80 text-sm mt-1">Semua log yang dianalisis dalam kondisi normal</p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{result.threats?.length || 0}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Ancaman</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{result.overallThreatLevel}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Level</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  {result.threats?.length > 0 ? (
                    <div className="w-6 h-6 rounded-full bg-red-600 animate-pulse" aria-label="Berbahaya"></div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-green-600" aria-label="Aman"></div>
                  )}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wide mt-1">Status</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <SearchIcon className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium mb-2">Belum Ada Analisis</p>
            <p className="text-slate-500 text-sm">Mulai streaming log untuk memulai analisis otomatis</p>
          </div>
        )}
      </div>
    </div>
  );
}
