'use client';

const ThreatIcon = ({ level, pulse }) => {
  const baseClass = `w-8 h-8 ${pulse ? 'animate-pulse' : ''}`;
  switch (level) {
    case 'CRITICAL':
      return (<svg className={baseClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>);
    case 'HIGH':
      return (<svg className={baseClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" /></svg>);
    case 'MEDIUM':
      return (<svg className={baseClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>);
    case 'LOW':
      return (<svg className={baseClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>);
    default:
      return (<svg className={baseClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" /></svg>);
  }
};

export default function ThreatLevelIndicator({ level = 'NONE' }) {
  const getLevelConfig = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { 
          bg: 'from-red-500 to-rose-600', 
          text: 'text-white', 
          label: 'KRITIS',
          pulse: true,
          description: 'Ancaman sangat tinggi'
        };
      case 'HIGH':
        return { 
          bg: 'from-orange-500 to-red-500', 
          text: 'text-white', 
          label: 'TINGGI',
          pulse: true,
          description: 'Ancaman tinggi'
        };
      case 'MEDIUM':
        return { 
          bg: 'from-yellow-500 to-orange-500', 
          text: 'text-white', 
          label: 'SEDANG',
          pulse: false,
          description: 'Ancaman sedang'
        };
      case 'LOW':
        return { 
          bg: 'from-blue-500 to-cyan-500', 
          text: 'text-white', 
          label: 'RENDAH',
          pulse: false,
          description: 'Ancaman rendah'
        };
      default:
        return { 
          bg: 'from-green-500 to-emerald-600', 
          text: 'text-white', 
          label: 'AMAN',
          pulse: false,
          description: 'Tidak ada ancaman'
        };
    }
  };

  const config = getLevelConfig(level);

  return (
    <div
      className={`bg-gradient-to-br ${config.bg} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow`}
      role="status"
      aria-label={`Tingkat ancaman: ${config.label} — ${config.description}`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/90 text-sm font-semibold uppercase tracking-wider">Tingkat Ancaman</p>
        <ThreatIcon level={level} pulse={config.pulse} />
      </div>
      <p className={`text-4xl font-bold mb-1 ${config.text}`}>{config.label}</p>
      <p className="text-white/80 text-sm">{config.description}</p>
      
      {/* Progress Bar */}
      <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={level === 'CRITICAL' ? 100 : level === 'HIGH' ? 75 : level === 'MEDIUM' ? 50 : level === 'LOW' ? 25 : 0} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className="bg-white h-full transition-all duration-500"
          style={{ 
            width: level === 'CRITICAL' ? '100%' : 
                   level === 'HIGH' ? '75%' : 
                   level === 'MEDIUM' ? '50%' : 
                   level === 'LOW' ? '25%' : '0%' 
          }}
        />
      </div>
    </div>
  );
}
