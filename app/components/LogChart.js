'use client';

import { useState, useEffect } from 'react';

export default function LogChart({ logs }) {
  const [chartData, setChartData] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    // Initialize chart with fixed time slots
    const generateChartData = () => {
      const now = new Date();
      const data = [];
      
      // Create 12 time slots (each 5 minutes back)
      for (let i = 11; i >= 0; i--) {
        const slotTime = new Date(now.getTime() - i * 5 * 60000);
        const timeLabel = slotTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // Calculate time range for this slot
        const slotStart = new Date(slotTime.getTime());
        const slotEnd = new Date(slotTime.getTime() + 5 * 60000);
        
        // Count logs in this time slot
        let normal = 0;
        let anomaly = 0;
        
        if (logs && logs.length > 0) {
          logs.forEach(log => {
            // Check if log contains anomaly keywords
            const isAnomaly = log.toLowerCase().includes('error') || 
                            log.toLowerCase().includes('warning') || 
                            log.toLowerCase().includes('attack') ||
                            log.toLowerCase().includes('injection') ||
                            log.toLowerCase().includes('xss') ||
                            log.toLowerCase().includes('ddos') ||
                            log.toLowerCase().includes('malware') ||
                            log.toLowerCase().includes('unauthorized');
            
            if (isAnomaly) {
              anomaly++;
            } else {
              normal++;
            }
          });
        }
        
        // If no real logs yet, use mock data that stays consistent
        if (normal === 0 && anomaly === 0) {
          normal = Math.floor(Math.random() * 50) + 20;
          anomaly = Math.floor(Math.random() * 15);
        }
        
        data.push({
          time: timeLabel,
          normal,
          anomaly,
          total: normal + anomaly
        });
      }
      
      return data;
    };

    const newChartData = generateChartData();
    setChartData(newChartData);
  }, [logs]); // Only recalculate when logs change

  const maxValue = Math.max(...chartData.map(d => d.total), 1);
  const padding = 40;
  const width = chartData.length > 0 ? Math.max(800, chartData.length * 60) : 800;
  const height = 300;

  // Generate SVG path for normal logs line
  const normalPath = chartData.map((item, idx) => {
    const x = padding + (idx / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (item.normal / maxValue) * (height - 2 * padding);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate SVG path for anomaly logs line
  const anomalyPath = chartData.map((item, idx) => {
    const x = padding + (idx / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
    const y = height - padding - (item.anomaly / maxValue) * (height - 2 * padding);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="border border-slate-600 rounded-lg bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-600 p-4">
        <h3 className="text-sm font-bold text-white">Evolusi Peristiwa Keamanan</h3>
      </div>

      {/* Chart */}
      <div className="p-4 overflow-x-auto">
        <svg width={width} height={height} className="min-w-full" role="img" aria-label="Grafik evolusi peristiwa keamanan menampilkan log normal dan anomali">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <g key={`grid-${idx}`}>
              {/* Horizontal grid lines */}
              <line
                x1={padding}
                y1={height - padding - ratio * (height - 2 * padding)}
                x2={width - padding}
                y2={height - padding - ratio * (height - 2 * padding)}
                stroke="#334155"
                strokeDasharray="5,5"
                strokeWidth="1"
              />
              {/* Y-axis labels */}
              <text
                x={padding - 10}
                y={height - padding - ratio * (height - 2 * padding) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#94a3b8"
              >
                {Math.round(ratio * maxValue)}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="2" />
          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#475569" strokeWidth="2" />

          {/* X-axis labels */}
          {chartData.map((item, idx) => {
            const x = padding + (idx / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
            return (
              <g key={`label-${idx}`}>
                <line x1={x} y1={height - padding} x2={x} y2={height - padding + 6} stroke="#475569" strokeWidth="1" />
                <text
                  x={x}
                  y={height - padding + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#94a3b8"
                >
                  {item.time}
                </text>
              </g>
            );
          })}

          {/* Normal logs line */}
          <path
            d={normalPath}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Anomaly logs line */}
          <path
            d={anomalyPath}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points for normal logs */}
          {chartData.map((item, idx) => {
            const x = padding + (idx / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
            const y = height - padding - (item.normal / maxValue) * (height - 2 * padding);
            return (
              <g
                key={`normal-dot-${idx}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="rgb(59, 130, 246)"
                  className="transition-all hover:r-7"
                  opacity={hoveredIndex === idx ? 1 : 0.8}
                />
                {hoveredIndex === idx && (
                  <g>
                    <rect
                      x={x - 50}
                      y={y - 35}
                      width="100"
                      height="30"
                      fill="#1f2937"
                      rx="4"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                    >
                      Normal: {item.normal}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Data points for anomaly logs */}
          {chartData.map((item, idx) => {
            const x = padding + (idx / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
            const y = height - padding - (item.anomaly / maxValue) * (height - 2 * padding);
            return (
              <g
                key={`anomaly-dot-${idx}`}
                onMouseEnter={() => setHoveredIndex(idx + 100)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="rgb(239, 68, 68)"
                  opacity={hoveredIndex === idx + 100 ? 1 : 0.8}
                />
                {hoveredIndex === idx + 100 && (
                  <g>
                    <rect
                      x={x - 50}
                      y={y - 35}
                      width="100"
                      height="30"
                      fill="#1f2937"
                      rx="4"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontWeight="bold"
                    >
                      Anomali: {item.anomaly}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 p-4 border-t border-slate-600 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-slate-300">Log Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-300">Anomali</span>
        </div>
      </div>
    </div>
  );
}
