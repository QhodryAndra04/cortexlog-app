import { query } from '@/lib/db';

/**
 * Service untuk pencarian ancaman (Threat Hunting) dan audit log.
 */

export async function getThreatHuntingLogs({ range = 'all', limit = 1000, searchQuery = "", onlyThreats = false }) {
  const conditions = [];
  if (range === "1h") {
    conditions.push("p.timestamp >= NOW() - INTERVAL '1 hour'");
  } else if (range === "24h") {
    conditions.push("p.timestamp >= NOW() - INTERVAL '24 hours'");
  } else if (range === "7d") {
    conditions.push("p.timestamp >= CURRENT_DATE - INTERVAL '6 days'");
  } else if (range === "30d") {
    conditions.push("p.timestamp >= CURRENT_DATE - INTERVAL '29 days'");
  }
  // 'all' range adds no timestamp condition, taking everything.

  // Selalu filter hanya serangan dan anomali (Abaikan yang Normal)
  conditions.push("(m.attack_type != 'Normal' OR m.is_anomaly = true)");
  conditions.push("m.id_ml_result IS NOT NULL"); // Pastikan sudah diproses ML

  if (searchQuery) {
    conditions.push(`(
      p.ip_address ILIKE $2 OR 
      p.request_url ILIKE $2 OR 
      m.attack_type ILIKE $2 OR
      p.method ILIKE $2
    )`);
  }

  const fullWhere = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const queryParams = searchQuery ? [limit, `%${searchQuery}%`] : [limit];

  const results = await query(
    `
    SELECT 
      p.id_parsed as id,
      COALESCE(m.processed_at, p.timestamp) as timestamp,
      p.ip_address as source,
      p.method,
      p.request_url as path,
      p.status_code as "statusCode",
      p.user_agent as "userAgent",
      p.bytes_sent as "responseSize",
      p.http_version as "httpVersion",
      m.attack_type as "attackType",
      m.is_anomaly,
      m.confidence_score as confidence,
      m.anomaly_score
    FROM parsed_logs p
    LEFT JOIN machine_learning_results m ON p.id_parsed = m.id_parsed
    ${fullWhere}
    ORDER BY COALESCE(m.processed_at, p.timestamp) DESC
    LIMIT $1
    `,
    queryParams
  );

  return results.map((row) => {
    let level = "normal";
    if (row.attackType && row.attackType !== "Normal") {
      level = "critical";
    } else if (row.is_anomaly) {
      level = "warning";
    }

    const fullLog = `${row.source} - - [${new Date(row.timestamp).toISOString()}] "${row.method} ${row.path} ${row.httpVersion}" ${row.statusCode} ${row.responseSize} "-" "${row.userAgent}"`;

    return {
      id: row.id,
      timestamp: row.timestamp,
      level: level,
      source: row.source,
      method: row.method || "-",
      path: row.path || "/",
      statusCode: row.statusCode || 200,
      userAgent: row.userAgent || "-",
      responseSize: row.responseSize || 0,
      attackType: row.attackType || "Normal",
      confidence: row.confidence || 0,
      anomalyScore: row.anomaly_score || 0,
      isAnomaly: row.is_anomaly || false,
      fullLog: fullLog,
    };
  });
}
