"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import AnomalyLineChart from "@/app/components/AnomalyLineChart";
import ThreatDistributionChart from "@/app/components/ThreatDistributionChart";
import ThreatLevelBarChart from "@/app/components/ThreatLevelBarChart";
import TopAgentsChart from "@/app/components/TopAgentsChart";

// Ported formatters
import { 
  formatThreatLevelCounts, 
  formatAttackDistribution, 
  formatTopAgents 
} from "@/lib/utils/formatters";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_logs: 0,
    anomalies: 0,
    attacks: 0,
    attack_distribution: [],
    top_agents: [],
    timeline: [],
  });
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Menambahkan cache-buster untuk memastikan data selalu segar
      const res = await fetch(`/api/dashboard/stats?range=${timeRange}&t=${Date.now()}`);
      if (!res.ok) throw new Error("Gagal mengambil data statistik");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    // Reset timeline agar grafik tidak menampilkan data lama saat loading
    setStats(prev => ({ ...prev, timeline: [] }));
    fetchStats();
    
    const intervalId = setInterval(fetchStats, 60000); // 1 menit sekali
    return () => clearInterval(intervalId);
  }, [timeRange, fetchStats]);

  // Map backend stats using external formatters
  const { lowCount, mediumCount, highCount, criticalCount } = useMemo(() => 
    formatThreatLevelCounts(stats), [stats]
  );

  const threatDistribution = useMemo(() => 
    formatAttackDistribution(stats), [stats]
  );

  const topAgents = useMemo(() => 
    formatTopAgents(stats), [stats]
  );

  return (
    <div className="bg-[#151719]">
      {/* FILTER BAR */}
      <div className="px-6 pt-6 flex flex-wrap items-center justify-end gap-4">
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
          {[
            { id: "1h",  label: "1 Jam" },
            { id: "24h", label: "24 Jam" },
            { id: "7d",  label: "7 Hari" },
            { id: "30d", label: "30 Hari" },
            { id: "all", label: "Semua" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                timeRange === r.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* B. KPI CARDS ROW */}
      <div className="px-6 py-6" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Logs */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Log
            </p>
            <p className="text-3xl font-bold text-white">
              {stats.total_logs.toLocaleString()}
            </p>
          </div>

          {/* Security Alerts (High + Critical) */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Peringatan Keamanan
            </p>
            <p className="text-3xl font-bold text-red-500">{highCount + criticalCount}</p>
            <p className="text-red-500 text-xs mt-2 font-medium">Masalah Tinggi & Kritis</p>
          </div>

          {/* Anomalies (ML) */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Anomali
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.anomalies}
            </p>
            <p className="text-yellow-400 text-xs mt-2 font-medium">Mencurigakan</p>
          </div>

          {/* Engine Status */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Status Mesin
            </p>
            <p className="text-3xl font-bold text-green-400">ONLINE</p>
            <p className="text-green-400 text-xs mt-2 font-medium">Latensi 2ms</p>
          </div>
        </div>
      </div>

      {/* C. TIME SERIES CHART */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Timeline Deteksi Anomali
          </h2>
          {isLoading && <span className="text-[10px] text-blue-400 animate-pulse font-bold uppercase tracking-widest">Memperbarui Data...</span>}
        </div>
        <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 overflow-hidden shadow-xl transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
          <AnomalyLineChart 
            key={`chart-${timeRange}`} 
            dbTimeline={stats.timeline} 
          />
        </div>
      </div>

      {/* D. AGGREGATION WIDGETS (3 Columns) */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Threat Level Distribution */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">
              Distribusi Level Ancaman
            </h3>
            <ThreatLevelBarChart
              lowCount={lowCount}
              mediumCount={mediumCount}
              highCount={highCount}
              criticalCount={criticalCount}
            />
          </div>

          {/* Center: Threat Distribution */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">
              Distribusi Jenis Serangan
            </h3>
            <ThreatDistributionChart alertDist={threatDistribution} />
          </div>

          {/* Right: Top Agents */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Top 5 Agen</h3>
            <TopAgentsChart agents={topAgents} />
          </div>
        </div>
      </div>
    </div>
  );
}
