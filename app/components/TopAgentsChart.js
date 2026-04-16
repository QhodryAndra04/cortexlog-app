'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function TopAgentsChart({ logs = [], agents = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Gunakan pre-calculated agents list jika diberikan
    if (agents && agents.length > 0) {
      return {
        series: agents.map((item) => item.count),
        labels: agents.map((item) => item.os),
      };
    }

    // Default jika tidak ada data dari props agents
    return {
      series: [45, 32, 28, 15, 12],
      labels: ["Windows", "macOS", "Linux", "iOS", "Android"],
    };
  }, [agents, logs]);

  const options = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ['#0ea5e9', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              color: '#cbd5e1',
              fontSize: '12px',
            },
            value: {
              show: false,
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#cbd5e1',
        fontSize: '12px',
      },
      onItemClick: {
        toggleDataSeries: false,
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
    <div className="w-full h-full" role="img" aria-label="Grafik distribusi agen teratas">
      {mounted && (
        <Chart
          options={{ ...options, labels: chartData.labels }}
          series={chartData.series}
          type="donut"
          height="280"
        />
      )}
    </div>
  );
}
