"use client";

import { useState } from "react";

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Aliran Log Real-time
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Monitoring aktivitas log secara langsung dengan deteksi anomali
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSimulating 
                ? "bg-green-100 text-green-700 animate-pulse" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {isSimulating ? "● LIVE" : "● STOPPED"}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={onStart}
              disabled={isSimulating}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                isSimulating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              <span>▶</span>
              <span>Mulai Streaming</span>
            </button>
            <button
              onClick={onStop}
              disabled={!isSimulating}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                !isSimulating
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              <span>⏹</span>
              <span>Berhenti</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all" 
                  ? "bg-blue-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setFilter("normal")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "normal" 
                  ? "bg-green-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setFilter("anomaly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "anomaly" 
                  ? "bg-red-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Anomali
            </button>
            <label className="flex items-center gap-2 ml-4">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Gulir otomatis</span>
            </label>
          </div>
        </div>
      </div>

      {/* Log Display */}
      <div className="p-6 bg-gray-950 text-green-400 font-mono text-sm h-[500px] overflow-y-auto rounded-b-xl">
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-lg">Tidak ada log yang sesuai filter</p>
            <p className="text-sm mt-2">
              {logs.length === 0 
                ? "Klik 'Start Streaming' untuk memulai monitoring"
                : "Coba ubah filter untuk melihat log lainnya"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-words py-1.5 px-2 rounded ${getLogClass(log)} hover:bg-gray-800/50 transition`}
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Total Log: <span className="font-bold text-gray-800">{logs.length}</span>
          </span>
          <span className="text-gray-600">
            Ditampilkan: <span className="font-bold text-gray-800">{filteredLogs.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
