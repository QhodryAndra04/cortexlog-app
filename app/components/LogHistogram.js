"use client";

import { useMemo } from "react";

export default function LogHistogram({ logs }) {
  const histogramData = useMemo(() => {
    // Group logs by hour
    const hourBuckets = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      const key = `${hour}:00`;
      
      if (!hourBuckets[key]) {
        hourBuckets[key] = {
          normal: 0,
          warning: 0,
          critical: 0,
          total: 0
        };
      }

      hourBuckets[key].total++;
      if (log.level === 'critical') {
        hourBuckets[key].critical++;
      } else if (log.level === 'warning') {
        hourBuckets[key].warning++;
      } else {
        hourBuckets[key].normal++;
      }
    });

    // Create sorted array for last 24 hours
    const buckets = [];
    for (let i = 0; i < 24; i++) {
      const key = `${String(i).padStart(2, '0')}:00`;
      buckets.push({
        time: key,
        ...hourBuckets[key] || { normal: 0, warning: 0, critical: 0, total: 0 }
      });
    }

    return buckets;
  }, [logs]);

  const maxValue = Math.max(...histogramData.map(d => d.total), 1);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">🔍 Timeline Log Volume</h3>
        <p className="text-xs text-slate-400">Shows log volume distribution over the last 24 hours</p>
      </div>

      {/* Histogram */}
      <div className="flex items-end justify-between gap-1 h-32 bg-slate-900/50 rounded p-4">
        {histogramData.map((bucket, index) => {
          const normalHeight = (bucket.normal / maxValue) * 100;
          const warningHeight = (bucket.warning / maxValue) * 100;
          const criticalHeight = (bucket.critical / maxValue) * 100;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${bucket.time}: ${bucket.total} logs (Critical: ${bucket.critical}, Warning: ${bucket.warning}, Normal: ${bucket.normal})`}
            >
              {/* Stacked bar chart */}
              <div className="w-full flex flex-col-reverse items-center justify-end gap-px h-24 relative group">
                {criticalHeight > 0 && (
                  <div
                    className="w-full bg-red-600 rounded-t opacity-80 hover:opacity-100 transition"
                    style={{ height: `${criticalHeight}%` }}
                  />
                )}
                {warningHeight > 0 && (
                  <div
                    className="w-full bg-yellow-600 opacity-80 hover:opacity-100 transition"
                    style={{ height: `${warningHeight}%` }}
                  />
                )}
                {normalHeight > 0 && (
                  <div
                    className="w-full bg-blue-600 rounded-b opacity-80 hover:opacity-100 transition"
                    style={{ height: `${normalHeight}%` }}
                  />
                )}
                {bucket.total === 0 && (
                  <div className="w-full h-1 bg-slate-700 rounded opacity-30" />
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="invisible group-hover:visible absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 whitespace-nowrap z-10">
                {bucket.total}
              </div>

              {/* Time label */}
              <span className="text-xs text-slate-500 text-center w-full truncate">
                {bucket.time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded" />
          <span className="text-slate-400">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-600 rounded" />
          <span className="text-slate-400">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded" />
          <span className="text-slate-400">Normal</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
        <div>
          <p className="text-xs text-slate-500 mb-1">Total Events</p>
          <p className="text-lg font-bold text-slate-200">{logs.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Critical Events</p>
          <p className="text-lg font-bold text-red-400">{logs.filter(l => l.level === 'critical').length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Warning Events</p>
          <p className="text-lg font-bold text-yellow-400">{logs.filter(l => l.level === 'warning').length}</p>
        </div>
      </div>
    </div>
  );
}
