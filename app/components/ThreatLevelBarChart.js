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
        columnWidth: '55%',
        borderRadius: 6,
        distributed: true,
        dataLabels: {
          position: 'top', // meletakkan angka di atas batang
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      offsetY: -20, // jarak angka dari ujung batang
      style: {
        fontSize: '13px',
        fontWeight: 'bold',
        colors: ['#f1f5f9'], // warna putih terang agar kontras
      },
    },
    legend: {
      show: false, // sembunyikan legend karena sudah ada label di sumbu X
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '11px',
        },
      },
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      style: {
        fontSize: '12px',
      },
    },
  };

  const colors = ['#22c55e', '#f59e0b', '#ef4444', '#b91c1c'];
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
