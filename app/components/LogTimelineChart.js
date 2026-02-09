'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function LogTimelineChart({ logs }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Group logs by 60-minute intervals
    const minuteBuckets = {};
    
    if (logs && logs.length > 0) {
      logs.forEach(log => {
        const date = new Date(log.timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        // Round to nearest 60-minute interval
        const minute60 = Math.floor(minutes / 60) * 60;
        const key = `${String(hours).padStart(2, '0')}:${String(minute60).padStart(2, '0')}`;
        
        if (!minuteBuckets[key]) {
          minuteBuckets[key] = { normal: 0, warning: 0, critical: 0 };
        }

        // Categorize by level
        if (log.level === 'critical') {
          minuteBuckets[key].critical++;
        } else if (log.level === 'warning') {
          minuteBuckets[key].warning++;
        } else {
          minuteBuckets[key].normal++;
        }
      });
    } else {
      // Default data when no logs - realistic traffic pattern for 60-minute intervals (6 hours)
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const time = new Date(now.getTime() - i * 60 * 60000);
        const hours = time.getHours();
        const key = `${String(hours).padStart(2, '0')}:00`;
        
        // Generate realistic pattern
        let normalCount = Math.floor(Math.random() * 30) + 15;
        let warningCount = Math.floor(Math.random() * 5) + 1;
        let criticalCount = Math.floor(Math.random() * 3) + 1;
        
        // Peak anomalies occasionally
        if (Math.random() < 0.15) {
          warningCount = Math.floor(Math.random() * 8) + 3;
          criticalCount = Math.floor(Math.random() * 6) + 2;
        }
        
        minuteBuckets[key] = {
          normal: normalCount,
          warning: warningCount,
          critical: criticalCount
        };
      }
    }

    const categories = Object.keys(minuteBuckets).sort().reverse();

    return {
      series: [
        {
          name: 'Normal Logs',
          data: categories.map(cat => minuteBuckets[cat].normal),
        },
        {
          name: 'Warning',
          data: categories.map(cat => minuteBuckets[cat].warning),
        },
        {
          name: 'Anomalies Detected',
          data: categories.map(cat => minuteBuckets[cat].critical),
        },
      ],
      categories,
    };
  }, [logs]);

  const options = {
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    plotOptions: {
      bar: {
        columnWidth: '80%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
        },
      },
      axisBorder: {
        color: '#334155',
      },
      axisTicks: {
        color: '#334155',
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
        },
      },
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      labels: {
        colors: '#cbd5e1',
      },
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
  };

  return (
    <div className="w-full">
      {mounted && (
        <Chart
          options={options}
          series={chartData.series}
          type="bar"
          height="300"
        />
      )}
    </div>
  );
}
