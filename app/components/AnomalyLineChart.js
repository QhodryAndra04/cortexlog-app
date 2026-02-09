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

export default function AnomalyLineChart({ logs }) {
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
    if (logs && logs.length > 0) {
      logs.forEach((log, idx) => {
        // Distribute logs evenly across time slots
        const slotIndex = Math.floor(
          ((idx % logs.length) * categories.length) / Math.max(logs.length, 6),
        );
        const timeKey = categories[Math.min(slotIndex, categories.length - 1)];

        // Categorize by level - extract from log object or parse Apache log format
        let level = "normal";
        
        if (typeof log === "object" && log.level) {
          level = log.level;
        } else if (typeof log === "string") {
          // Parse Apache log format to extract HTTP status code
          // Format: "IP - - [date] "METHOD path HTTP/1.x" STATUS_CODE response_size"
          const statusMatch = log.match(/"\s+(\d{3})\s+/);
          if (statusMatch) {
            const statusCode = parseInt(statusMatch[1]);
            
            // Determine level based on HTTP status code and log content
            if (statusCode >= 400 && statusCode < 500) {
              // Client errors (400-499) = warning
              level = "warning";
            } else if (statusCode >= 500) {
              // Server errors (500-599) = critical
              level = "critical";
            }
            
            // Check for attack patterns in the log
            if (
              log.includes("injection") ||
              log.includes("union") ||
              log.includes("select") ||
              log.includes("script") ||
              log.includes("etc/passwd") ||
              log.includes("sqlmap") ||
              log.includes("DDoS")
            ) {
              level = "critical";
            }
          }
        }

        if (level === "critical") {
          timeSlots[timeKey].critical++;
        } else if (level === "warning") {
          timeSlots[timeKey].warning++;
        } else {
          timeSlots[timeKey].normal++;
        }
      });
    } else {
      // Default data when no logs
      timeSlots[categories[0]] = { normal: 15, warning: 1, critical: 0 };
      timeSlots[categories[1]] = { normal: 20, warning: 2, critical: 0 };
      timeSlots[categories[2]] = { normal: 25, warning: 3, critical: 1 };
      timeSlots[categories[3]] = { normal: 22, warning: 2, critical: 1 };
      timeSlots[categories[4]] = { normal: 28, warning: 4, critical: 1 };
      timeSlots[categories[5]] = { normal: 30, warning: 3, critical: 2 };
    }

    return {
      series: [
        {
          name: "Normal Logs",
          data: categories.map((cat) => timeSlots[cat].normal),
        },
        {
          name: "Warning",
          data: categories.map((cat) => timeSlots[cat].warning),
        },
        {
          name: "Anomalies Detected",
          data: categories.map((cat) => timeSlots[cat].critical),
        },
      ],
      categories,
    };
  }, [logs]);

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
    colors: ["#0ea5e9", "#f59e0b", "#ef4444"],
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
    <div className="w-full h-full">
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
