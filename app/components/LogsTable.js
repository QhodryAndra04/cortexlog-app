"use client";

import React, { useState } from "react";

export default function LogsTable({ logs, expandedRows, onToggleRow }) {
  const [activeTab, setActiveTab] = useState({});

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
      case "info":
        return "#0ea5e9"; // blue
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
      case "info":
        return "bg-blue-900/30";
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
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-slate-600 text-white";
    }
  };

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th className="px-4 py-3 text-left text-slate-300 font-semibold w-8"></th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
                Time
              </th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold w-20">
                Level
              </th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
                Source IP
              </th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold min-w-40">
                Event / Description
              </th>
              <th className="px-4 py-3 text-left text-slate-300 font-semibold min-w-32">
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
                  No logs found matching the criteria
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
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
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"po
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
                        className={`px-2.5 py-1 rounded text-xs font-bold ${getLevelBadgeColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </td>

                    {/* Source IP */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-slate-300 bg-slate-800 px-2 py-1 rounded">
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
                        <div className="flex gap-4 mb-4 border-b border-slate-700">
                          <button
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
                            📋 Table View
                          </button>
                          <button
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
                            {} JSON
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {(activeTab[log.id] || "table") === "table" ? (
                            // Table View
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Timestamp
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {new Date(log.timestamp).toLocaleString(
                                    "id-ID",
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Source IP
                                </p>
                                <p className="text-slate-200 font-mono">
                                  {log.source}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Method
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
                              <div className="md:col-span-3">
                                <p className="text-slate-400 text-xs font-semibold mb-1">
                                  Jenis Serangan
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-200 font-semibold">
                                    {log.attackType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // JSON View
                            <div className="bg-slate-900 border border-slate-700 rounded p-4 overflow-auto max-h-96">
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
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 text-sm text-slate-400">
        Showing {logs.length} record{logs.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
