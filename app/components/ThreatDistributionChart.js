'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function ThreatDistributionChart({ alerts = [], alertDist = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Gunakan pre-calculated distribution dari database jika diberikan
    if (alertDist && alertDist.length > 0) {
      return {
        series: alertDist.map((d) => d.count),
        labels: alertDist.map((d) => d.type),
      };
    }

    return {
      series: [],
      labels: [],
    };
  }, [alertDist]);

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
    colors: ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1', '#10b981'],
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
    <div className="w-full h-full" role="img" aria-label="Grafik distribusi jenis ancaman">
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
