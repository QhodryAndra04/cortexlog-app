'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function ThreatLevelBarChart({ lowCount, mediumCount, highCount, criticalCount = 0 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    return {
      series: [
        {
          name: 'Jumlah Ancaman',
          data: [lowCount, mediumCount, highCount, criticalCount],
        },
      ],
      categories: ['Rendah', 'Sedang', 'Tinggi', 'Kritis'],
    };
  }, [lowCount, mediumCount, highCount, criticalCount]);

  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'],
    plotOptions: {
      bar: {
        columnWidth: '45%',
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'top',
      style: {
        fontSize: '12px',
        colors: ['#cbd5e1'],
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
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
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
  };

  // Dynamic colors based on threat levels
  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#dc2626'];
  const newOptions = { ...options, colors };
  return (
    <div className="w-full h-full" role="img" aria-label="Grafik batang level ancaman">
      {mounted && (
        <Chart
          options={newOptions}
          series={chartData.series}
          type="bar"
          height="280"
        />
      )}
    </div>
  );
}
