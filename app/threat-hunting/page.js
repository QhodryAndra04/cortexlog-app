"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import LogsTable from "@/app/components/LogsTable";
import * as XLSX from "xlsx";

export default function ThreatHuntingPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/threat-hunting");
      if (!res.ok) throw new Error("Gagal mengambil data log");
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filter logs based on query
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => {
        const queryMatch = 
          log.path.toLowerCase().includes(query) ||
          log.source.includes(query) ||
          log.method.toLowerCase().includes(query) ||
          log.attackType.toLowerCase().includes(query) ||
          log.fullLog.toLowerCase().includes(query);
        
        return queryMatch;
      });
    }

    return filtered;
  }, [searchQuery, logs]);



  const exportCSV = useCallback(() => {
    const headers = ["Timestamp", "Level", "Source IP", "Method", "Path", "Status", "Attack Type", "Confidence"];
    const rows = filteredLogs.map(log => [
      log.timestamp,
      log.level,
      log.source,
      log.method,
      log.path,
      log.statusCode,
      log.attackType,
      log.confidence
    ]);

    // Create worksheet
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    const colWidths = [25, 12, 15, 10, 30, 10, 15, 12];
    ws['!cols'] = colWidths.map(width => ({ wch: width }));
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Threat Logs");
    
    // Download
    XLSX.writeFile(wb, `threat-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredLogs]);

  return (
    <div className="bg-[#151719]">

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Filter & Query Bar */}
        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <label htmlFor="threat-search" className="sr-only">Cari log</label>
            <input
              id="threat-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari log... (cth: SQL Injection, path, IP address)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm transition"
            />
          </div>

          {/* Toolbar */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400" aria-live="polite">
              Menampilkan {filteredLogs.length} dari {logs.length} log
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-slate-600 transition text-sm font-medium inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Ekspor Excel
              </button>
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
