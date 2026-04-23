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
    // Jika tidak ada data, tampilkan placeholder kosong
    if (!dbTimeline || dbTimeline.length === 0) {
      const now = new Date();
      const placeholderCats = [];
      for (let i = 5; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 3600000);
        placeholderCats.push(`${String(time.getHours()).padStart(2, "0")}:00`);
      }
      return {
        series: [{ name: "Normal", data: [0,0,0,0,0,0] }, { name: "Anomali", data: [0,0,0,0,0,0] }],
        categories: placeholderCats
      };
    }

    // Gunakan data langsung dari DB secara dinamis
    // Gunakan data langsung dari DB secara dinamis
    const categories = [];
    const normalData = [];
    const anomalyData = [];
    const timelineData = [...dbTimeline];

    if (timelineData.length === 0) return { series: [], categories: [] };

    // Calculate actual range from data
    const firstTime = new Date(timelineData[0].time_bucket);
    const lastTime = new Date(timelineData[timelineData.length - 1].time_bucket);
    const diffMs = lastTime.getTime() - firstTime.getTime();

    timelineData.forEach((t) => {
      const date = new Date(t.time_bucket);
      let label = "";
      
      if (diffMs <= 3601000) {
        // Range <= 1 hour: Show HH:mm (Minutes)
        label = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      } else if (diffMs <= 86401000) {
        // Range <= 24 hours: Show HH:00 (Hours)
        label = `${String(date.getHours()).padStart(2, "0")}:00`;
      } else if (diffMs <= 86400000 * 8) {
        // Range <= 7 days: Show DD/MM
        label = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Range > 7 days: Show DD/MM
        label = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      
      categories.push(label);
      normalData.push(parseInt(t.normals, 10));
      anomalyData.push(parseInt(t.anomalies, 10));
    });

    return {
      series: [
        { name: "Normal (Isolation Forest)", data: normalData },
        { name: "Anomali (Isolation Forest)", data: anomalyData },
      ],
      categories,
    };
  }, [dbTimeline]);

  const options = {
    chart: {
      type: "area",
      stacked: false,
      toolbar: {
        show: false,
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
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6,
      }
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
      tickAmount: 10,
      labels: {
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        style: {
          colors: "#94a3b8",
          fontSize: "10px",
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
      forceNiceScale: true,
      min: 0,
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
