'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function ThreatDistributionChart({ alerts }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const threatTypes = ['SQL Injection', 'XSS', 'Brute Force', 'DOS'];
    const threatMap = {
      'SQL Injection': 0,
      'XSS': 0,
      'Brute Force': 0,
      'DOS': 0,
    };

    if (alerts && alerts.length > 0) {
      alerts.forEach(alert => {
        const type = alert.attackType || 'DOS';
        if (threatMap.hasOwnProperty(type)) {
          threatMap[type]++;
        } else {
          // Map unknown types to DOS or adjust as needed
          threatMap['DOS']++;
        }
      });
    } else {
      // Default values when no alerts
      threatMap['SQL Injection'] = 25;
      threatMap['Brute Force'] = 20;
      threatMap['XSS'] = 30;
      threatMap['DOS'] = 25;
    }

    return {
      series: Object.values(threatMap),
      labels: threatTypes,
    };
  }, [alerts]);

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
    colors: ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'],
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
    <div className="w-full h-full">
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
