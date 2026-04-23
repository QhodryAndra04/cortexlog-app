/**
 * Service untuk memproses teks log mentah menjadi data terstruktur.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helper Format Tanggal
// Mengubah dd/Mon/YYYY:HH:MM:SS +zone menjadi format timestamp PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────
export function formatTimestamp(apacheTimestamp) {
    try {
      const regex = /^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})$/;
      const m = apacheTimestamp.match(regex);
      if (!m) return new Date().toISOString();
  
      const [, d, mon, y, h, min, s, z] = m;
      const months = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
      };
      const isoString = `${y}-${months[mon]}-${d}T${h}:${min}:${s}${z}`;
      return new Date(isoString).toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse satu baris Apache Combined Log Format
// ─────────────────────────────────────────────────────────────────────────────
export function parseApacheLog(line) {
    const regex = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+(.*?)\s+(HTTP\/\S+)"\s+(\d+)\s+(\d+|-)\s+"([^"]*)"\s+"([^"]*)"/;
    const m = line.match(regex);
    if (!m) return null;
  
    const [, ip, timestamp, method, url, http_version, statusStr, sizeStr, referer, userAgent] = m;
    return {
      raw_log:       line,
      ip_address:    ip,
      timestamp:     formatTimestamp(timestamp),
      method:        method,
      request_url:   url,
      http_version:  http_version,
      status_code:   parseInt(statusStr, 10),
      bytes_sent:    sizeStr === '-' ? 0 : parseInt(sizeStr, 10),
      referrer:      referer === '-' ? '' : referer,
      user_agent:    userAgent,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hitung statistik per IP dalam satu batch
// ─────────────────────────────────────────────────────────────────────────────
export function buildIpStats(parsedLogs) {
    const stats = {};
    for (const log of parsedLogs) {
      const ip = log.ip_address;
      if (!stats[ip]) {
        stats[ip] = { request_count: 0, failed_auth: 0, error_count: 0, login_attempts: 0 };
      }
      stats[ip].request_count += 1;
      if (log.status_code === 401 || log.status_code === 403) stats[ip].failed_auth += 1;
      if ([500, 502, 503, 504].includes(log.status_code))     stats[ip].error_count  += 1;
      if (/login|signin|auth/i.test(log.request_url))         stats[ip].login_attempts += 1;
    }
    return stats;
}
