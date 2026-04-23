import { query } from "@/lib/db";

/**
 * Membantu meringkas nama User-Agent agar tidak terlalu panjang di UI
 */
function simplifyUserAgent(ua) {
  if (!ua) return "Unknown";
  const uaLower = ua.toLowerCase();

  if (uaLower.includes("hydra")) return "Hydra (Brute Force Tool)";
  if (uaLower.includes("sqlmap")) return "sqlmap (SQLi Tool)";
  if (uaLower.includes("nmap")) return "Nmap (Scanner)";
  if (uaLower.includes("nikto")) return "Nikto (Scanner)";
  if (uaLower.includes("chrome")) return "Chrome Browser";
  if (uaLower.includes("firefox")) return "Firefox Browser";
  if (uaLower.includes("safari") && !uaLower.includes("chrome"))
    return "Safari Browser";
  if (uaLower.includes("edge")) return "Edge Browser";
  if (uaLower.includes("python-requests")) return "Python Script";
  if (uaLower.includes("curl")) return "cURL Command";
  if (uaLower.includes("postman")) return "Postman";
  if (uaLower.includes("whatsapp")) return "WhatsApp Bot";

  // Jika tidak dikenal, ambil 20 karakter pertama
  return ua.length > 25 ? ua.substring(0, 22) + "..." : ua;
}

/**
 * Service untuk menangani pengambilan data statistik dashboard.
 */

export async function getDashboardStats(range = "all") {
  // Mode Produksi: Semua hitungan berbasis waktu saat ini (NOW)
  let startTimeSql = "NOW() - INTERVAL '24 hours'";
  let endTimeSql = "NOW()";
  let dateTrunc = "hour";
  let seriesInterval = "1 hour";

  if (range === "1h") {
    startTimeSql = "NOW() - INTERVAL '1 hour'";
    dateTrunc = "minute";
    seriesInterval = "1 minute";
  } else if (range === "24h") {
    startTimeSql = "NOW() - INTERVAL '24 hours'";
    dateTrunc = "hour";
    seriesInterval = "1 hour";
  } else if (range === "7d") {
    startTimeSql = "CURRENT_DATE - INTERVAL '6 days'";
    dateTrunc = "day";
    seriesInterval = "1 day";
  } else if (range === "30d") {
    startTimeSql = "CURRENT_DATE - INTERVAL '29 days'";
    dateTrunc = "day";
    seriesInterval = "1 day";
  } else {
    // Range ALL: Terakhir 30 hari sebagai default produksi
    startTimeSql = "CURRENT_DATE - INTERVAL '29 days'";
    dateTrunc = "day";
    seriesInterval = "1 day";
  }

  const whereClause = `p.timestamp BETWEEN ${startTimeSql} AND ${endTimeSql}`;
  const timelineWhere = `p.timestamp BETWEEN ${startTimeSql} AND ${endTimeSql}`;

  // 1. Total Logs
  const totalLogResult = await query(`
    SELECT COUNT(*) as total 
    FROM parsed_logs p 
    WHERE ${whereClause}
  `);
  const totalLogs = parseInt(totalLogResult[0]?.total || 0, 10);

  // 2. Anomaly & Attack Counts
  const threatCountsResult = await query(`
    SELECT 
      SUM(CASE WHEN m.is_anomaly = true OR m.attack_type != 'Normal' THEN 1 ELSE 0 END) as total_anomalies,
      SUM(CASE WHEN m.attack_type != 'Normal' AND m.attack_type != 'Unknown Anomaly' THEN 1 ELSE 0 END) as total_attacks
    FROM machine_learning_results m
    JOIN parsed_logs p ON m.id_parsed = p.id_parsed
    WHERE ${whereClause}
  `);

  // 3. Attack Distribution
  const attackDistResult = await query(`
    SELECT m.attack_type, COUNT(*) as count 
    FROM machine_learning_results m
    JOIN parsed_logs p ON m.id_parsed = p.id_parsed
    WHERE ${whereClause} AND m.attack_type != 'Normal' 
    GROUP BY m.attack_type
  `);

  // 4. Top 5 User-Agent
  const rawTopAgents = await query(`
    SELECT user_agent as agent, COUNT(*) as count 
    FROM parsed_logs p
    WHERE ${whereClause}
    GROUP BY user_agent 
    ORDER BY count DESC 
    LIMIT 5
  `);

  const topAgentsResult = rawTopAgents.map((r) => ({
    agent: simplifyUserAgent(r.agent),
    count: parseInt(r.count, 10),
  }));

  // 5. Timeline Chart Data
  const timelineResult = await query(`
    WITH time_series AS (
      SELECT generate_series(
        (${startTimeSql})::timestamp,
        (${endTimeSql})::timestamp,
        '${seriesInterval}'::interval
      ) as bucket
    ),
    logged_data AS (
      SELECT 
        DATE_TRUNC('${dateTrunc}', p.timestamp) as log_bucket,
        COUNT(p.id_parsed) FILTER (WHERE m.is_anomaly = true OR (m.attack_type IS NOT NULL AND m.attack_type != 'Normal')) as anomalies,
        COUNT(p.id_parsed) FILTER (WHERE m.is_anomaly IS NOT TRUE AND (m.attack_type = 'Normal' OR m.attack_type IS NULL OR m.id_ml_result IS NULL)) as normals
      FROM parsed_logs p
      LEFT JOIN machine_learning_results m ON p.id_parsed = m.id_parsed
      WHERE ${timelineWhere}
      GROUP BY 1
    )
    SELECT 
      ts.bucket as time_bucket,
      COALESCE(ld.anomalies, 0) as anomalies,
      COALESCE(ld.normals, 0) as normals
    FROM time_series ts
    LEFT JOIN logged_data ld ON DATE_TRUNC('${dateTrunc}', ts.bucket) = ld.log_bucket
    ORDER BY ts.bucket ASC
  `);

  return {
    total_logs: totalLogs,
    anomalies: parseInt(threatCountsResult[0]?.total_anomalies || 0, 10),
    attacks: parseInt(threatCountsResult[0]?.total_attacks || 0, 10),
    attack_distribution: attackDistResult,
    top_agents: topAgentsResult,
    timeline: timelineResult,
  };
}
