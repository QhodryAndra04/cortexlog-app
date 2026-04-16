"use client";

import React, { useState, useEffect } from "react";

export default function LogsTable({ logs, expandedRows, onToggleRow }) {
  const [activeTab, setActiveTab] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage));
  const currentLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleRow = (id) => {
    onToggleRow((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    // Reset active tab when expanding
    if (!expandedRows[id]) {
      setActiveTab((prev) => ({ ...prev, [id]: "table" }));
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "#ef4444"; // red
      case "warning":
        return "#eab308"; // yellow
      case "normal":
      case "info":
        return "#10b981"; // emerald/green for normal
      default:
        return "#64748b"; // slate
    }
  };

  const getLevelBgColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-900/30";
      case "warning":
        return "bg-yellow-900/30";
      case "normal":
      case "info":
        return "bg-emerald-900/30";
      default:
        return "bg-slate-900/30";
    }
  };

  const getLevelBadgeColor = (level) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-600 text-white";
      case "normal":
      case "info":
        return "bg-emerald-500 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <caption className="sr-only">Tabel log keamanan</caption>
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold w-8"><span className="sr-only">Perluas</span></th>
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
                Waktu
              </th>
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold w-20">
                Level
              </th>
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
                IP Sumber
              </th>
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold min-w-40">
                Kejadian / Deskripsi
              </th>
              <th scope="col" className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
                Serangan
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Tidak ada log yang sesuai dengan kriteria
                </td>
              </tr>
            ) : (
              currentLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  {/* Main Row */}
                  <tr
                    onClick={() => toggleRow(log.id)}
                    className={`cursor-pointer border-b border-slate-700 transition ${
                      index % 2 === 0
                        ? "bg-[#151719] hover:bg-[#2b3035]"
                        : "bg-[#1a1c20] hover:bg-[#2b3035]"
                    }`}
                  >
                    {/* Expand Icon */}
                    <td className="px-4 py-3">
                      <svg
                        className={`w-4 h-4 text-slate-400 transition transform ${expandedRows[log.id] ? "rotate-90" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString("id-ID")}
                    </td>

                    {/* Level */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getLevelBadgeColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>

                    {/* Source IP */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded-lg">
                        {log.source}
                      </span>
                    </td>

                    {/* Event / Description */}
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      <span className="font-mono truncate block">
                        {log.method} {log.path.substring(0, 50)}
                        {log.path.length > 50 ? "..." : ""}
                      </span>
                    </td>

                    {/* ML Analysis */}
                    <td className="px-4 py-3">
                      {log.attackType !== "Normal" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {log.attackType}
                          </span>
                        </div>
                      ) : log.isAnomaly ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-yellow-500">
                            Anomali
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedRows[log.id] && (
                    <tr
                      className={`${index % 2 === 0 ? "bg-[#1a1c20]" : "bg-[#151719]"}`}
                    >
                      <td
                        colSpan="6"
                        className="px-4 py-4 border-b border-slate-700"
                      >
                        {/* Tab Navigation */}
                        <div className="flex gap-4 mb-4 border-b border-slate-700" role="tablist" aria-label="Tampilan detail log">
                          <button
                            role="tab"
                            aria-selected={(activeTab[log.id] || "table") === "table"}
                            aria-controls={`tabpanel-table-${log.id}`}
                            id={`tab-table-${log.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab((prev) => ({
                                ...prev,
                                [log.id]: "table",
                              }));
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                              (activeTab[log.id] || "table") === "table"
                                ? "border-blue-500 text-blue-400"
                                : "border-transparent text-slate-400 hover:text-slate-300"
                            }`}
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Tampilan Tabel
                          </button>
                          <button
                            role="tab"
                            aria-selected={(activeTab[log.id] || "table") === "json"}
                            aria-controls={`tabpanel-json-${log.id}`}
                            id={`tab-json-${log.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab((prev) => ({
                                ...prev,
                                [log.id]: "json",
                              }));
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                              (activeTab[log.id] || "table") === "json"
                                ? "border-blue-500 text-blue-400"
                                : "border-transparent text-slate-400 hover:text-slate-300"
                            }`}
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                            JSON
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {(activeTab[log.id] || "table") === "table" ? (
                            // Table View
                            <div role="tabpanel" id={`tabpanel-table-${log.id}`} aria-labelledby={`tab-table-${log.id}`} className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Stempel Waktu
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {new Date(log.timestamp).toLocaleString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  IP Sumber
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {log.source}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Metode
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {log.method}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Path
                                </p>
                                <p className="text-slate-200 font-mono text-xs break-all">
                                  {log.path}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Kode Status
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {log.statusCode}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Ukuran Respons
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {log.responseSize} byte
                                </p>
                              </div>
                              <div className="md:col-span-3">
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Agen Pengguna
                                </p>
                                <p className="text-slate-200 font-mono text-xs break-all">
                                  {log.userAgent}
                                </p>
                              </div>
                              <div className="col-span-1">
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Jenis Serangan / ML
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-200 font-semibold">
                                    {log.attackType !== "Normal" ? log.attackType : (log.isAnomaly ? "Anomali" : "Normal")}
                                  </span>
                                </div>
                              </div>
                              <div className="col-span-1">
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Confidence / Anomaly Score
                                </p>
                                <p className="text-slate-200 font-mono">
                                  Conf: {log.confidence}% | Score: {log.anomalyScore}
                                </p>
                              </div>
                            </div>
                          ) : (
                            // JSON View
                            <div role="tabpanel" id={`tabpanel-json-${log.id}`} aria-labelledby={`tab-json-${log.id}`} className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-auto max-h-96">
                              <pre className="text-slate-300 font-mono text-xs">
                                {JSON.stringify(
                                  {
                                    timestamp: log.timestamp,
                                    level: log.level,
                                    source: log.source,
                                    method: log.method,
                                    path: log.path,
                                    statusCode: log.statusCode,
                                    responseSize: log.responseSize,
                                    userAgent: log.userAgent,
                                    attackType: log.attackType,
                                    isAnomaly: log.isAnomaly,
                                    anomalyScore: log.anomalyScore,
                                    confidence: log.confidence,
                                    rawLog: log.fullLog,
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-400 gap-4">
        <div>
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, logs.length)} dari {logs.length} data
        </div>
        
        {totalPages > 1 && (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 disabled:opacity-50 transition"
            >
              Sebelumnya
            </button>
            <span className="font-medium text-slate-300">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 disabled:opacity-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
