"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import LogsTable from "@/app/components/LogsTable";
import { showSuccess, showError } from "@/lib/swal";

export default function ThreatHuntingPage() {
  const [timeRange, setTimeRange] = useState("all");
  const [onlyThreats, setOnlyThreats] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/threat-hunting?range=${timeRange}&q=${encodeURIComponent(searchQuery)}&onlyThreats=${onlyThreats}`);
      if (!res.ok) throw new Error("Gagal mengambil data log");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      showError("Gagal Memuat Log", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, searchQuery, onlyThreats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fetchLogs, timeRange, searchQuery, onlyThreats]);

  const filteredLogs = useMemo(() => logs, [logs]);





  return (
    <div className="bg-[#151719]">

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Filter & Query Bar */}
        <div className="space-y-4">
          {/* Query Input & Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="threat-search" className="sr-only">Cari log ancaman</label>
              <input
                id="threat-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ancaman... (cth: SQLi, Brute Force, IP address)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition"
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-sm text-slate-400" aria-live="polite">
                Menampilkan {filteredLogs.length} log
                </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            Memuat data log dari database...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex justify-center">
            {error}
          </div>
        ) : (
          <LogsTable 
            logs={filteredLogs} 
            expandedRows={expandedRows} 
            onToggleRow={setExpandedRows}
          />
        )}
      </div>
    </div>
  );
}
