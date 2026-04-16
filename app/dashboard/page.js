"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import AnomalyLineChart from "@/app/components/AnomalyLineChart";
import ThreatDistributionChart from "@/app/components/ThreatDistributionChart";
import ThreatLevelBarChart from "@/app/components/ThreatLevelBarChart";
import TopAgentsChart from "@/app/components/TopAgentsChart";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_logs: 0,
    anomalies: 0,
    attacks: 0,
    attack_distribution: [],
    top_attackers: [],
    timeline: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Gagal mengambil data statistik");
      const data = await res.json();
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh otomatis setiap 30 detik
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  // Overall threat level as simple calculation
  let overallThreatLevel = "NONE";
  if (stats.attacks > 0) overallThreatLevel = "CRITICAL";
  else if (stats.anomalies > 0) overallThreatLevel = "MEDIUM";

  // Map backend stats to the UI chart expected props
  const { lowCount, mediumCount, highCount, criticalCount } = useMemo(() => {
    let low = 0, medium = stats.anomalies || 0, high = 0, critical = 0;
    
    if (stats.attack_distribution) {
      stats.attack_distribution.forEach(d => {
        const atk = d.attack_type.toUpperCase();
        const c = parseInt(d.count, 10);
        
        if (atk.includes("SQL") || atk.includes("TRAVERSAL")) {
          critical += c;
        } else if (atk.includes("XSS")) {
          high += c;
        } else if (atk.includes("BRUTE")) {
          medium += c;
        } else {
          // Unknown / Other attacks
          high += c;
        }
      });
    }
    return { lowCount: low, mediumCount: medium, highCount: high, criticalCount: critical };
  }, [stats.attack_distribution, stats.anomalies]);

  const threatDistribution = useMemo(() => {
    const defaultDist = [
      { type: "SQL Injection", count: 0, percentage: 0 },
      { type: "Brute Force", count: 0, percentage: 0 },
      { type: "XSS", count: 0, percentage: 0 },
    ];
    if (!stats.attack_distribution || stats.attack_distribution.length === 0) return defaultDist;
    
    let total = stats.attacks || 1;
    return stats.attack_distribution.map(d => ({
      type: d.attack_type,
      count: parseInt(d.count, 10),
      percentage: ((parseInt(d.count, 10) / total) * 100).toFixed(0)
    }));
  }, [stats.attack_distribution, stats.attacks]);

  const topAgents = useMemo(() => {
    if (!stats.top_agents || stats.top_agents.length === 0) return [];
    
    // Tampilkan User-Agent asli secara langsung sesuai permintaan
    return stats.top_agents.slice(0, 5).map(a => ({
      os: a.user_agent,
      count: parseInt(a.count, 10)
    }));
  }, [stats.top_agents]);

  return (
    <div className="bg-[#151719]">
      {/* B. KPI CARDS ROW */}
      <div className="px-6 py-6" aria-live="polite">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Logs */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Log
            </p>
            <p className="text-3xl font-bold text-white">
              {stats.total_logs.toLocaleString()}
            </p>
          </div>

          {/* Security Alerts (High + Critical) */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Peringatan Keamanan
            </p>
            <p className="text-3xl font-bold text-red-500">{highCount + criticalCount}</p>
            <p className="text-red-500 text-xs mt-2">Masalah Tinggi & Kritis</p>
          </div>

          {/* Anomalies (ML) */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Anomali
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              {mediumCount}
            </p>
            <p className="text-yellow-400 text-xs mt-2">Mencurigakan</p>
          </div>

          {/* Engine Status */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Status Mesin
            </p>
            <p className="text-3xl font-bold text-green-400">ONLINE</p>
            <p className="text-green-400 text-xs mt-2">Latensi 2ms</p>
          </div>
        </div>
      </div>

      {/* C. TIME SERIES CHART */}
      <div className="px-6 py-2">
        <h2 className="text-sm font-bold text-white mb-4">
          Timeline Deteksi Anomali
        </h2>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 overflow-hidden">
          <AnomalyLineChart dbTimeline={stats.timeline} />
        </div>
      </div>

      {/* D. AGGREGATION WIDGETS (3 Columns) */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Threat Level Distribution */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950">
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
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950">
            <h3 className="text-sm font-bold text-white mb-4">
              Distribusi Jenis Serangan
            </h3>
            {/* Reuse the component but pass mapped prop, ThreatDistributionChart expects 'alerts' to calculate natively but here we updated local 'threatDistribution' */}
            <ThreatDistributionChart alertDist={threatDistribution} />
          </div>

          {/* Right: Top Agents */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950">
            <h3 className="text-sm font-bold text-white mb-4">Top 5 Agen</h3>
            <TopAgentsChart agents={topAgents} />
          </div>
        </div>
      </div>
    </div>
  );
}
