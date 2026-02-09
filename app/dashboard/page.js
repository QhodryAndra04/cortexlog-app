"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import AnomalyLineChart from "@/app/components/AnomalyLineChart";
import ThreatDistributionChart from "@/app/components/ThreatDistributionChart";
import ThreatLevelBarChart from "@/app/components/ThreatLevelBarChart";
import TopAgentsChart from "@/app/components/TopAgentsChart";

// Sample log data in Apache format
const SAMPLE_LOG_DATA = `
192.168.1.100 - - [05/Feb/2024:10:15:32 +0000] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
192.168.1.101 - - [05/Feb/2024:10:15:45 +0000] "POST /api/login HTTP/1.1" 200 567 "-" "Mozilla/5.0"
203.0.113.45 - - [05/Feb/2024:10:16:01 +0000] "GET /search?q=union+select HTTP/1.1" 400 234 "-" "sqlmap/1.0"
192.168.1.50 - - [05/Feb/2024:10:16:15 +0000] "POST /admin HTTP/1.1" 403 189 "-" "curl/7.68.0"
198.51.100.22 - - [05/Feb/2024:10:17:00 +0000] "GET /api/user?id=1 OR 1=1 HTTP/1.1" 400 245 "-" "Python-urllib/3.8"
192.168.1.25 - - [05/Feb/2024:10:17:45 +0000] "PUT /files HTTP/1.1" 401 567 "-" "wget/1.20.3"
192.168.1.200 - - [05/Feb/2024:10:18:10 +0000] "GET /dashboard HTTP/1.1" 200 4567 "-" "Mozilla/5.0"
198.51.100.99 - - [05/Feb/2024:10:18:30 +0000] "GET / HTTP/1.0" 200 312 "-" "Mozilla/5.0"
203.0.113.78 - - [05/Feb/2024:10:18:45 +0000] "POST /login HTTP/1.1" 401 289 "-" "Mozilla/5.0"
192.168.1.75 - - [05/Feb/2024:10:19:00 +0000] "GET /static/js/app.js HTTP/1.1" 200 123456 "-" "Mozilla/5.0"
192.168.1.30 - - [05/Feb/2024:10:19:30 +0000] "GET /upload?file=../../etc/passwd HTTP/1.1" 400 145 "-" "curl/7.68.0"
192.168.1.150 - - [05/Feb/2024:10:20:00 +0000] "GET /profile?id=<script>alert(1)</script> HTTP/1.1" 400 267 "-" "Mozilla/5.0"
192.168.1.88 - - [05/Feb/2024:10:20:15 +0000] "GET /api/data HTTP/1.1" 200 6789 "-" "Mozilla/5.0"
192.168.1.55 - - [05/Feb/2024:10:20:45 +0000] "POST /admin/config HTTP/1.1" 403 123 "-" "curl/7.68.0"
203.0.113.99 - - [05/Feb/2024:10:21:00 +0000] "GET / HTTP/1.1" 200 890 "-" "Mozilla/5.0"
`.trim();

// Function to extract IP from Apache log format
const extractIPFromLog = (logLine) => {
  const match = logLine.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  return match ? match[1] : "0.0.0.0";
};

const LOG_STREAM_INTERVAL = 1500; // ms
const ANALYSIS_INTERVAL = 10000; // ms
const MAX_DISPLAYED_LOGS = 100;

const logLines = SAMPLE_LOG_DATA.split("\n");

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [logCount, setLogCount] = useState(0);
  const [totalThreats, setTotalThreats] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [lowThreatCount, setLowThreatCount] = useState(0);
  const [mediumThreatCount, setMediumThreatCount] = useState(0);
  const [highThreatCount, setHighThreatCount] = useState(0);
  const [criticalThreatCount, setCriticalThreatCount] = useState(0);

  const [isSimulating, setIsSimulating] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const logBuffer = useRef([]);
  const logIntervalRef = useRef(null);
  const analysisIntervalRef = useRef(null);

  // Mock analysis function (replace with real API call)
  const runAnalysis = useCallback(async () => {
    if (logBuffer.current.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    const logsToAnalyze = [...logBuffer.current];
    logBuffer.current = [];

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock result
      const mockThreats = [];

      // Extract IPs and log lines from logs that contain attack patterns
      const sqlInjectionLog = logsToAnalyze.find(
        (log) =>
          log.includes("injection") ||
          log.includes("union") ||
          log.includes("select"),
      );
      const xssLog = logsToAnalyze.find(
        (log) => log.includes("XSS") || log.includes("script"),
      );
      const ddosLog = logsToAnalyze.find((log) => log.includes("DDoS"));
      const bruteForceLog = logsToAnalyze.find(
        (log) => log.includes("unauthorized") || log.includes("401"),
      );
      const malwareLog = logsToAnalyze.find(
        (log) => log.includes("Malware") || log.includes("etc/passwd"),
      );

      if (sqlInjectionLog) {
        mockThreats.push({
          type: "SQL Injection",
          attackType: "SQL Injection",
          description:
            "Potential SQL injection attack detected in request parameters",
          ip: extractIPFromLog(sqlInjectionLog),
          logLine: sqlInjectionLog,
        });
      }
      if (xssLog) {
        mockThreats.push({
          type: "XSS Attack",
          attackType: "XSS",
          description: "Cross-site scripting attack attempt detected",
          ip: extractIPFromLog(xssLog),
          logLine: xssLog,
        });
      }
      if (ddosLog) {
        mockThreats.push({
          type: "DDoS Attack",
          attackType: "DoS",
          description: "Distributed denial of service attack pattern detected",
          ip: extractIPFromLog(ddosLog),
          logLine: ddosLog,
        });
      }
      if (malwareLog) {
        mockThreats.push({
          type: "Malware",
          attackType: "Other",
          description: "Malware signature detected in uploaded file",
          ip: extractIPFromLog(malwareLog),
          logLine: malwareLog,
        });
      }
      if (bruteForceLog) {
        mockThreats.push({
          type: "Unauthorized Access",
          attackType: "Brute Force",
          description: "Unauthorized access attempt detected",
          ip: extractIPFromLog(bruteForceLog),
          logLine: bruteForceLog,
        });
      }

      const threatLevelMap = {
        0: "NONE",
        1: "LOW",
        2: "MEDIUM",
        3: "HIGH",
        4: "CRITICAL",
      };
      const threatLevel =
        threatLevelMap[Math.min(mockThreats.length, 4)] || "NONE";

      setAnalysisResult({
        summary: `Analyzed ${logsToAnalyze.length} log entries. Found ${mockThreats.length} potential threats.`,
        overallThreatLevel: threatLevel,
        threats: mockThreats,
      });

      setTotalThreats((prev) => prev + mockThreats.length);

      // Categorize threats by severity
      const mockThreatsWithLevel = mockThreats.map((threat, index) => {
        let level;
        if (index % 4 === 0) {
          level = "CRITICAL";
        } else if (index % 4 === 1) {
          level = "HIGH";
        } else if (index % 4 === 2) {
          level = "MEDIUM";
        } else {
          level = "LOW";
        }
        return { ...threat, level };
      });

      mockThreatsWithLevel.forEach((threat) => {
        if (threat.level === "LOW") {
          setLowThreatCount((prev) => prev + 1);
        } else if (threat.level === "MEDIUM") {
          setMediumThreatCount((prev) => prev + 1);
        } else if (threat.level === "HIGH") {
          setHighThreatCount((prev) => prev + 1);
        } else if (threat.level === "CRITICAL") {
          setCriticalThreatCount((prev) => prev + 1);
        }
      });

      const newThreats = mockThreatsWithLevel.map((threat) => ({
        ...threat,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      }));

      setRecentAlerts((prevAlerts) =>
        [...newThreats, ...prevAlerts].slice(0, 10),
      );
    } catch (err) {
      setError(err.message || "An error occurred during analysis");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setError(null);

    logIntervalRef.current = window.setInterval(() => {
      const randomLog = logLines[Math.floor(Math.random() * logLines.length)];
      setDisplayedLogs((prev) =>
        [...prev, randomLog].slice(-MAX_DISPLAYED_LOGS),
      );
      logBuffer.current.push(randomLog);
      setLogCount((prev) => prev + 1);
    }, LOG_STREAM_INTERVAL);

    analysisIntervalRef.current = window.setInterval(() => {
      runAnalysis();
    }, ANALYSIS_INTERVAL);
  }, [runAnalysis]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    logIntervalRef.current = null;
    analysisIntervalRef.current = null;

    if (logBuffer.current.length > 0) {
      runAnalysis();
    }
  }, [runAnalysis]);

  // Auto-start simulation on mount
  useEffect(() => {
    startSimulation();
  }, [startSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      if (analysisIntervalRef.current)
        clearInterval(analysisIntervalRef.current);
    };
  }, []);

  const threatLevel = analysisResult?.overallThreatLevel ?? "NONE";

  // Calculate attack types distribution
  const threatDistribution = useMemo(() => {
    const sqlCount = recentAlerts.filter(
      (a) => a.attackType === "SQL Injection",
    ).length;
    const xssCount = recentAlerts.filter((a) => a.attackType === "XSS").length;
    const bruteForceCount = recentAlerts.filter(
      (a) => a.attackType === "Brute Force",
    ).length;
    const othersCount =
      recentAlerts.length - sqlCount - xssCount - bruteForceCount;

    return [
      {
        type: "SQL Injection",
        count: sqlCount,
        percentage:
          recentAlerts.length > 0
            ? ((sqlCount / recentAlerts.length) * 100).toFixed(0)
            : 0,
      },
      {
        type: "Brute Force",
        count: bruteForceCount,
        percentage:
          recentAlerts.length > 0
            ? ((bruteForceCount / recentAlerts.length) * 100).toFixed(0)
            : 0,
      },
      {
        type: "XSS",
        count: xssCount,
        percentage:
          recentAlerts.length > 0
            ? ((xssCount / recentAlerts.length) * 100).toFixed(0)
            : 0,
      },
      {
        type: "Others",
        count: othersCount,
        percentage:
          recentAlerts.length > 0
            ? ((othersCount / recentAlerts.length) * 100).toFixed(0)
            : 0,
      },
    ];
  }, [recentAlerts]);

  // Get top attackers
  const topAttackers = useMemo(() => {
    const ipCounts = {};
    recentAlerts.forEach((alert) => {
      ipCounts[alert.ip] = (ipCounts[alert.ip] || 0) + 1;
    });

    const result = Object.entries(ipCounts)
      .map(([ip, count]) => ({
        ip,
        count,
        severity: count > 5 ? "critical" : count > 2 ? "warning" : "info",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // If no data, provide default sample
    if (result.length === 0) {
      return [
        { ip: "203.0.113.45", count: 8, severity: "critical" },
        { ip: "198.51.100.22", count: 5, severity: "warning" },
        { ip: "192.168.1.30", count: 3, severity: "warning" },
        { ip: "192.168.1.150", count: 2, severity: "info" },
        { ip: "192.168.1.50", count: 1, severity: "info" },
      ];
    }

    return result;
  }, [recentAlerts]);

  return (
    <div style={{ backgroundColor: "#151719" }}>
      {/* B. KPI CARDS ROW */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Logs */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Log
            </p>
            <p className="text-3xl font-bold text-white">
              {logCount.toLocaleString()}
            </p>
          </div>

          {/* Security Alerts */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Peringatan Keamanan
            </p>
            <p className="text-3xl font-bold text-red-400">{highThreatCount}</p>
            <p className="text-red-400 text-xs mt-2">Kritis</p>
          </div>

          {/* Anomalies (ML) */}
          <div className="border border-slate-600 rounded-lg p-4 bg-slate-950">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Anomali
            </p>
            <p className="text-3xl font-bold text-yellow-400">
              {mediumThreatCount}
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
          <AnomalyLineChart logs={displayedLogs} />
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
              lowCount={lowThreatCount}
              mediumCount={mediumThreatCount}
              highCount={highThreatCount}
              criticalCount={criticalThreatCount}
            />
          </div>

          {/* Center: Threat Distribution */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950">
            <h3 className="text-sm font-bold text-white mb-4">
              Distribusi Jenis Serangan
            </h3>
            <ThreatDistributionChart alerts={recentAlerts} />
          </div>

          {/* Right: Top Agents */}
          <div className="border border-slate-600 rounded-lg p-5 bg-slate-950">
            <h3 className="text-sm font-bold text-white mb-4">Top 5 Agents</h3>
            <TopAgentsChart logs={displayedLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
