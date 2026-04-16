"use client";

import { useState } from "react";

// SVG icon components for cross-platform consistency
const ChartIcon = () => (
  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const StopIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
  </svg>
);
const ClipboardIcon = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export default function LogInput({
  onStart,
  onStop,
  isSimulating,
  isLoading,
  logs,
}) {
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState("all"); // all, normal, anomaly

  const getLogClass = (log) => {
    if (log.includes("ERROR") || log.includes("injection") || log.includes("XSS") || log.includes("DDoS") || log.includes("Malware") || log.includes("Unauthorized")) {
      return "text-red-400 bg-red-900/20 border-l-4 border-red-500 pl-2";
    }
    if (log.includes("WARNING")) {
      return "text-yellow-400 bg-yellow-900/20 border-l-4 border-yellow-500 pl-2";
    }
    return "text-green-400";
  };

  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "anomaly") {
      return log.includes("ERROR") || log.includes("injection") || log.includes("XSS") || log.includes("DDoS") || log.includes("Malware") || log.includes("Unauthorized") || log.includes("WARNING");
    }
    if (filter === "normal") {
      return log.includes("INFO") || log.includes("DEBUG");
    }
    return true;
  });

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-700 p-6 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <ChartIcon />
              Aliran Log Real-time
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Monitoring aktivitas log secara langsung dengan deteksi anomali
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSimulating 
                ? "bg-green-900/50 text-green-400 border border-green-700/50 animate-pulse" 
                : "bg-slate-800 text-slate-400 border border-slate-600"
            }`}>
              {isSimulating ? "● LIVE" : "● BERHENTI"}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={onStart}
              disabled={isSimulating}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isSimulating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <PlayIcon />
              <span>Mulai Streaming</span>
            </button>
            <button
              onClick={onStop}
              disabled={!isSimulating}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                !isSimulating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              <StopIcon />
              <span>Berhenti</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-slate-400">Filter:</span>
            <button
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setFilter("normal")}
              aria-pressed={filter === "normal"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "normal" 
                  ? "bg-green-600 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setFilter("anomaly")}
              aria-pressed={filter === "anomaly"}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "anomaly" 
                  ? "bg-red-600 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              Anomali
            </button>
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded"
              />
              <span className="text-sm text-slate-400">Gulir otomatis</span>
            </label>
          </div>
        </div>
      </div>

      {/* Log Display */}
      <div className="p-6 bg-[#0f1113] text-green-400 font-mono text-sm h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 text-center py-12 flex flex-col items-center">
            <ClipboardIcon />
            <p className="text-lg mt-4">Tidak ada log yang sesuai filter</p>
            <p className="text-sm mt-2">
              {logs.length === 0 
                ? "Klik 'Mulai Streaming' untuk memulai monitoring"
                : "Coba ubah filter untuk melihat log lainnya"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-words py-1.5 px-2 rounded ${getLogClass(log)} hover:bg-slate-800/50 transition`}
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="border-t border-slate-700 px-6 py-3 bg-slate-900/50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Total Log: <span className="font-bold text-white">{logs.length}</span>
          </span>
          <span className="text-slate-400">
            Ditampilkan: <span className="font-bold text-white">{filteredLogs.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
