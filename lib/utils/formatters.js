/**
 * Utility functions untuk memformat data dari API agar siap digunakan oleh Chart/UI.
 */

/**
 * Memetakan distribusi serangan ke dalam kategori tingkat ancaman (Low, Medium, High, Critical).
 */
export function formatThreatLevelCounts(stats) {
  let low = 0,
    medium = 0,
    high = 0,
    critical = 0;

  if (stats.attack_distribution) {
    stats.attack_distribution.forEach((d) => {
      const atk = d.attack_type.toUpperCase();
      const c = parseInt(d.count, 10);

      if (atk.includes("SQL") || atk.includes("TRAVERSAL")) {
        critical += c;
      } else if (atk.includes("XSS")) {
        high += c;
      } else if (atk.includes("BRUTE")) {
        medium += c;
      } else if (atk !== "UNKNOWN ANOMALY") {
        // Other specific attacks
        high += c;
      }
    });
  }
  return {
    lowCount: low,
    mediumCount: medium,
    highCount: high,
    criticalCount: critical,
  };
}

/**
 * Memformat distribusi jenis serangan untuk komponen ThreatDistributionChart.
 */
export function formatAttackDistribution(stats) {
  if (!stats.attack_distribution || stats.attack_distribution.length === 0) {
    return [];
  }

  let total = stats.attacks || 1;
  return stats.attack_distribution
    .filter((d) => d.attack_type !== "Unknown Anomaly")
    .map((d) => ({
      type: d.attack_type,
      count: parseInt(d.count, 10),
      percentage: ((parseInt(d.count, 10) / total) * 100).toFixed(0),
    }));
}

/**
 * Memformat data Top Agents untuk komponen TopAgentsChart.
 */
export function formatTopAgents(stats) {
  if (!stats.top_agents || stats.top_agents.length === 0) return [];

  return stats.top_agents.slice(0, 5).map((a) => ({
    os: a.agent,
    count: parseInt(a.count, 10),
  }));
}
