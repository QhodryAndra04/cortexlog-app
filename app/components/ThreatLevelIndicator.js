'use client';

export default function ThreatLevelIndicator({ level = 'NONE' }) {
  const getLevelConfig = (level) => {
    switch (level) {
      case 'CRITICAL':
        return { 
          bg: 'from-red-500 to-rose-600', 
          text: 'text-white', 
          label: 'KRITIS',
          icon: '🔴',
          pulse: true,
          description: 'Ancaman sangat tinggi'
        };
      case 'HIGH':
        return { 
          bg: 'from-orange-500 to-red-500', 
          text: 'text-white', 
          label: 'TINGGI',
          icon: '🟠',
          pulse: true,
          description: 'Ancaman tinggi'
        };
      case 'MEDIUM':
        return { 
          bg: 'from-yellow-500 to-orange-500', 
          text: 'text-white', 
          label: 'SEDANG',
          icon: '🟡',
          pulse: false,
          description: 'Ancaman sedang'
        };
      case 'LOW':
        return { 
          bg: 'from-blue-500 to-cyan-500', 
          text: 'text-white', 
          label: 'RENDAH',
          icon: '🔵',
          pulse: false,
          description: 'Ancaman rendah'
        };
      default:
        return { 
          bg: 'from-green-500 to-emerald-600', 
          text: 'text-white', 
          label: 'AMAN',
          icon: '🟢',
          pulse: false,
          description: 'Tidak ada ancaman'
        };
    }
  };

  const config = getLevelConfig(level);

  return (
    <div className={`bg-gradient-to-br ${config.bg} rounded-xl shadow-lg p-6 text-white ${config.pulse ? 'animate-pulse' : ''} hover:shadow-xl transition-all transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/90 text-sm font-semibold uppercase tracking-wider">Tingkat Ancaman</p>
        <div className="text-3xl">{config.icon}</div>
      </div>
      <p className={`text-4xl font-bold mb-1 ${config.text}`}>{config.label}</p>
      <p className="text-white/80 text-sm">{config.description}</p>
      
      {/* Progress Bar */}
      <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
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
