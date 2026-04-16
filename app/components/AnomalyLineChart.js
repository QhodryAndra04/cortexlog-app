"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";

const Chart = dynamic(
  () => import("react-apexcharts").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 flex items-center justify-center text-slate-400">
        Memuat grafik...
      </div>
    ),
  },
);

export default function AnomalyLineChart({ logs, dbTimeline }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    // Generate time slots with 60-minute intervals
    const now = new Date();
    const timeSlots = {};

    // Generate 6 time slots (every 60 minutes backwards)
    const categories = [];
    for (let i = 5; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60000);
      const hours = time.getHours();
      const timeKey = `${String(hours).padStart(2, "0")}:00`;
      categories.push(timeKey);
      timeSlots[timeKey] = { normal: 0, warning: 0, critical: 0 };
    }

    // Distribute logs across time slots
    // Jika mendapat data langsung dari database
    if (dbTimeline && dbTimeline.length > 0) {
      dbTimeline.forEach((t) => {
        // Asumsi time format: '2024-02-05T10:00:00.000Z'
        const time = new Date(t.hour_bucket);
        const hours = time.getHours();
        const timeKey = `${String(hours).padStart(2, "0")}:00`;
        
        if (timeSlots[timeKey]) {
          timeSlots[timeKey].normal = parseInt(t.normals, 10);
          timeSlots[timeKey].critical = parseInt(t.anomalies, 10);
        }
      });
    } else if (logs && logs.length > 0) {
      // Logic lama (fallback) untuk parsing mock logs
      logs.forEach((log, idx) => {
        const slotIndex = Math.floor(
          ((idx % logs.length) * categories.length) / Math.max(logs.length, 6),
        );
        const timeKey = categories[Math.min(slotIndex, categories.length - 1)];

        let level = "normal";
        if (typeof log === "object" && log.level) {
          level = log.level;
        } else if (typeof log === "string") {
          const statusMatch = log.match(/"\s+(\d{3})\s+/);
          if (statusMatch) {
            const statusCode = parseInt(statusMatch[1]);
            if (statusCode >= 500 || ((statusCode >= 400) && (log.includes("injection") || log.includes("union")))) {
              level = "critical";
            }
          }
        }

        if (level === "critical") {
          timeSlots[timeKey].critical++;
        } else {
          timeSlots[timeKey].normal++;
        }
      });
    } else {
      // Default jika tidak ada data
      timeSlots[categories[0]] = { normal: 0, warning: 0, critical: 0 };
    }

    return {
      series: [
        {
          name: "Normal (Isolation Forest)",
          data: categories.map((cat) => timeSlots[cat].normal),
        },
        {
          name: "Anomali (Isolation Forest)",
          data: categories.map((cat) => timeSlots[cat].critical),
        },
      ],
      categories,
    };
  }, [logs, dbTimeline]);

  const options = {
    chart: {
      type: "area",
      stacked: false,
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    colors: ["#0ea5e9", "#ef4444"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.3,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
      axisBorder: {
        color: "#334155",
      },
      axisTicks: {
        color: "#334155",
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#334155",
      strokeDashArray: 4,
    },
    legend: {
      position: "top",
      labels: {
        colors: "#cbd5e1",
      },
    },
    tooltip: {
      theme: "dark",
      style: {
        fontSize: "12px",
      },
    },
  };

  return (
    <div className="w-full h-full" role="img" aria-label="Grafik tren anomali dari waktu ke waktu">
      {mounted && (
        <Chart
          options={options}
          series={chartData.series}
          type="area"
          height="300"
        />
      )}
    </div>
  );
}
