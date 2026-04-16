import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Dapatkan Total Log dari apache_logs
    const totalLogResult = await query(`SELECT COUNT(*) as total FROM apache_logs`);
    const totalLogs = parseInt(totalLogResult[0]?.total || 0, 10);

    // 2. Dapatkan perhitungan threats dari machine_learning_results
    const threatCountsResult = await query(`
      SELECT 
        COUNT(*) as total_analyzed,
        SUM(CASE WHEN is_anomaly = true THEN 1 ELSE 0 END) as total_anomalies,
        SUM(CASE WHEN attack_type != 'Normal' THEN 1 ELSE 0 END) as total_attacks
      FROM machine_learning_results
    `);
    
    // Aggregasi untuk top agents dan distribution map
    const attackDistResult = await query(`
      SELECT attack_type, COUNT(*) as count 
      FROM machine_learning_results 
      WHERE attack_type != 'Normal' 
      GROUP BY attack_type
    `);

    // Top 5 User-Agent (Sistem Operasi / Browser) dari parsed_log
    const topAgentsResult = await query(`
      SELECT user_agent, COUNT(*) as count
      FROM parsed_logs
      WHERE user_agent IS NOT NULL AND user_agent != ''
      GROUP BY user_agent
      ORDER BY count DESC
    `);

    // 3. Timeline dari Isolation Forest (Normal vs Anomali per jam, 6 jam terakhir)
    const timelineResult = await query(`
      SELECT 
        DATE_TRUNC('hour', p.timestamp) as hour_bucket,
        SUM(CASE WHEN m.is_anomaly = true THEN 1 ELSE 0 END) as anomalies,
        SUM(CASE WHEN m.is_anomaly = false OR m.id_ml_result IS NULL THEN 1 ELSE 0 END) as normals
      FROM parsed_logs p
      LEFT JOIN machine_learning_results m ON p.id_parsed = m.id_parsed
      WHERE p.timestamp >= NOW() - INTERVAL '6 hours'
      GROUP BY DATE_TRUNC('hour', p.timestamp)
      ORDER BY hour_bucket ASC
    `);

    let totalAnomalies = parseInt(threatCountsResult[0]?.total_anomalies || 0, 10);
    let totalAttacks = parseInt(threatCountsResult[0]?.total_attacks || 0, 10);

    return Response.json({
      success: true,
      data: {
        total_logs: totalLogs,
        anomalies: totalAnomalies,
        attacks: totalAttacks,
        attack_distribution: attackDistResult,
        top_agents: topAgentsResult,
        timeline: timelineResult,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json({ error: 'Gagal mengambil statistik dashboard' }, { status: 500 });
  }
}
