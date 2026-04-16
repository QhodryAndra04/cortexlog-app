import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 1000;

    // Ambil log yang sudah digabung dengan hasil ML
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
      ORDER BY COALESCE(m.processed_at, p.timestamp) DESC
      LIMIT $1
    `,
      [limit],
    );

    // Map properties agar sesuai dengan format frontend LogsTable
    const formattedLogs = results.map((row) => {
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
        confidence: row.confidence ? row.confidence : 0, // Assume value is exactly what model or DB outputs
        anomalyScore: row.anomaly_score || 0,
        isAnomaly: row.is_anomaly || false,
        fullLog: fullLog,
      };
    });

    return Response.json({
      success: true,
      data: formattedLogs,
    });
  } catch (error) {
    console.error("Error fetching threat hunting logs:", error);
    return Response.json(
      { error: "Gagal mengambil data log: " + error.message },
      { status: 500 },
    );
  }
}
