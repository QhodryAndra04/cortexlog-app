"use client";

import { useState, useCallback, useMemo } from "react";
import LogsTable from "@/app/components/LogsTable";
import * as XLSX from "xlsx";

// Expanded sample log data with more variety
const SAMPLE_LOGS = [
  {
    id: 1,
    timestamp: "2024-02-20T14:30:05.123Z",
    level: "critical",
    source: "203.0.113.45",
    method: "GET",
    path: "/search?q=union+select",
    statusCode: 400,
    userAgent: "sqlmap/1.0",
    responseSize: 234,
    attackType: "SQL Injection",
    confidence: 98.5,
    fullLog: '203.0.113.45 - - [20/Feb/2024:14:30:05 +0000] "GET /search?q=union+select HTTP/1.1" 400 234 "-" "sqlmap/1.0"'
  },
  {
    id: 2,
    timestamp: "2024-02-20T14:31:12.456Z",
    level: "info",
    source: "192.168.1.100",
    method: "GET",
    path: "/",
    statusCode: 200,
    userAgent: "Mozilla/5.0",
    responseSize: 1234,
    attackType: "Normal",
    confidence: 0,
    fullLog: '192.168.1.100 - - [20/Feb/2024:14:31:12 +0000] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0"'
  },
  {
    id: 3,
    timestamp: "2024-02-20T14:32:45.789Z",
    level: "critical",
    source: "198.51.100.22",
    method: "GET",
    path: "/api/user?id=1 OR 1=1",
    statusCode: 400,
    userAgent: "Python-urllib/3.8",
    responseSize: 245,
    attackType: "SQL Injection",
    confidence: 95.2,
    fullLog: '198.51.100.22 - - [20/Feb/2024:14:32:45 +0000] "GET /api/user?id=1 OR 1=1 HTTP/1.1" 400 245 "-" "Python-urllib/3.8"'
  },
  {
    id: 4,
    timestamp: "2024-02-20T14:33:22.012Z",
    level: "warning",
    source: "192.168.1.50",
    method: "POST",
    path: "/admin",
    statusCode: 403,
    userAgent: "curl/7.68.0",
    responseSize: 189,
    attackType: "Brute Force",
    confidence: 87.3,
    fullLog: '192.168.1.50 - - [20/Feb/2024:14:33:22 +0000] "POST /admin HTTP/1.1" 403 189 "-" "curl/7.68.0"'
  },
  {
    id: 5,
    timestamp: "2024-02-20T14:34:08.345Z",
    level: "critical",
    source: "203.0.113.78",
    method: "GET",
    path: "/profile?id=<script>alert(1)</script>",
    statusCode: 400,
    userAgent: "Mozilla/5.0",
    responseSize: 267,
    attackType: "XSS",
    confidence: 92.1,
    fullLog: '203.0.113.78 - - [20/Feb/2024:14:34:08 +0000] "GET /profile?id=<script>alert(1)</script> HTTP/1.1" 400 267 "-" "Mozilla/5.0"'
  },
  {
    id: 6,
    timestamp: "2024-02-20T14:35:33.678Z",
    level: "info",
    source: "192.168.1.200",
    method: "GET",
    path: "/dashboard",
    statusCode: 200,
    userAgent: "Mozilla/5.0",
    responseSize: 4567,
    attackType: "Normal",
    confidence: 0,
    fullLog: '192.168.1.200 - - [20/Feb/2024:14:35:33 +0000] "GET /dashboard HTTP/1.1" 200 4567 "-" "Mozilla/5.0"'
  },
  {
    id: 7,
    timestamp: "2024-02-20T14:36:15.901Z",
    level: "critical",
    source: "192.168.1.30",
    method: "GET",
    path: "/upload?file=../../etc/passwd",
    statusCode: 400,
    userAgent: "curl/7.68.0",
    responseSize: 145,
    attackType: "Path Traversal",
    confidence: 88.7,
    fullLog: '192.168.1.30 - - [20/Feb/2024:14:36:15 +0000] "GET /upload?file=../../etc/passwd HTTP/1.1" 400 145 "-" "curl/7.68.0"'
  },
  {
    id: 8,
    timestamp: "2024-02-20T14:37:42.234Z",
    level: "warning",
    source: "203.0.113.99",
    method: "POST",
    path: "/login",
    statusCode: 401,
    userAgent: "Mozilla/5.0",
    responseSize: 289,
    attackType: "Brute Force",
    confidence: 81.5,
    fullLog: '203.0.113.99 - - [20/Feb/2024:14:37:42 +0000] "POST /login HTTP/1.1" 401 289 "-" "Mozilla/5.0"'
  },
  {
    id: 9,
    timestamp: "2024-02-20T14:38:56.567Z",
    level: "info",
    source: "192.168.1.75",
    method: "GET",
    path: "/static/js/app.js",
    statusCode: 200,
    userAgent: "Mozilla/5.0",
    responseSize: 123456,
    attackType: "Normal",
    confidence: 0,
    fullLog: '192.168.1.75 - - [20/Feb/2024:14:38:56 +0000] "GET /static/js/app.js HTTP/1.1" 200 123456 "-" "Mozilla/5.0"'
  },
  {
    id: 10,
    timestamp: "2024-02-20T14:39:11.890Z",
    level: "critical",
    source: "198.51.100.99",
    method: "GET",
    path: "/search?q=exec()",
    statusCode: 400,
    userAgent: "wget/1.20.3",
    responseSize: 312,
    attackType: "Code Injection",
    confidence: 93.8,
    fullLog: '198.51.100.99 - - [20/Feb/2024:14:39:11 +0000] "GET /search?q=exec() HTTP/1.1" 400 312 "-" "wget/1.20.3"'
  },
];

export default function ThreatHuntingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  // Filter logs based on query
  const filteredLogs = useMemo(() => {
    let filtered = SAMPLE_LOGS;

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
  }, [searchQuery]);



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
    <div style={{ backgroundColor: '#151719' }}>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        
        {/* Filter & Query Bar */}
        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari log... (cth: SQL Injection, path, IP address)"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>

          {/* Toolbar */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Menampilkan {filteredLogs.length} dari {SAMPLE_LOGS.length} log
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-slate-600 transition text-sm font-medium"
              >
                📊 Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <LogsTable 
          logs={filteredLogs} 
          expandedRows={expandedRows} 
          onToggleRow={setExpandedRows}
        />
      </div>
    </div>
  );
}
