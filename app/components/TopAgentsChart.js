'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';

const Chart = dynamic(
  () => import('react-apexcharts').then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-80 flex items-center justify-center text-slate-400">Memuat grafik...</div> }
);

export default function TopAgentsChart({ logs }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const agentMap = {};

    // Function to extract User-Agent from Apache log format or object
    const extractAgent = (log) => {
      if (!log) return 'Unknown';
      
      // If log is an object with userAgent property
      if (typeof log === 'object' && log.userAgent) {
        return log.userAgent;
      }
      
      // If log is a string (Apache log format), extract userAgent from last quoted string
      if (typeof log === 'string') {
        const matches = log.match(/"([^"]*)"/g);
        if (matches && matches.length > 0) {
          // Last quoted string is usually the User-Agent
          const lastQuoted = matches[matches.length - 1];
          return lastQuoted.replace(/"/g, '');
        }
      }
      
      return 'Unknown';
    };

    // Function to parse and extract OS from user agent
    const parseAgent = (userAgent) => {
      if (!userAgent || userAgent === 'Unknown' || userAgent === '-') return 'Unknown';
      
      // Extract OS from User-Agent string
      if (userAgent.includes('Windows NT 10.0')) {
        return 'Windows 10';
      } else if (userAgent.includes('Windows NT 11')) {
        return 'Windows 11';
      } else if (userAgent.includes('Windows NT')) {
        return 'Windows';
      } else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS X')) {
        if (userAgent.includes('10_15')) return 'macOS 10.15';
        if (userAgent.includes('10_14')) return 'macOS 10.14';
        if (userAgent.includes('11')) return 'macOS 11+';
        return 'macOS';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
        if (userAgent.includes('OS 17')) return 'iOS 17';
        if (userAgent.includes('OS 16')) return 'iOS 16';
        return 'iOS';
      } else if (userAgent.includes('Android')) {
        if (userAgent.includes('Android 14')) return 'Android 14';
        if (userAgent.includes('Android 13')) return 'Android 13';
        return 'Android';
      } else if (userAgent.includes('Linux') && !userAgent.includes('Android')) {
        if (userAgent.includes('Debian')) return 'Debian';
        if (userAgent.includes('Ubuntu')) return 'Ubuntu';
        return 'Linux';
      } else if (userAgent.includes('X11')) {
        return 'Unix/Linux';
      }
      
      return 'Other OS';
    };

    if (logs && logs.length > 0) {
      logs.forEach(log => {
        const rawAgent = extractAgent(log);
        const agent = parseAgent(rawAgent);
        agentMap[agent] = (agentMap[agent] || 0) + 1;
      });
    } else {
      // Default data when no logs - simplified agent names
      agentMap['Chrome 120'] = 156;
      agentMap['Safari iOS'] = 122;
      agentMap['Chrome Mobile 121'] = 98;
      agentMap['Safari macOS'] = 67;
      agentMap['Firefox 121'] = 45;
    }

    // Get top 5 agents
    const sortedAgents = Object.entries(agentMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sortedAgents.map(([agent]) => agent);
    const series = sortedAgents.map(([, count]) => count);

    return {
      series,
      labels,
    };
  }, [logs]);

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
