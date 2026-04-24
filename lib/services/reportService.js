import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

/**
 * Service untuk mengelola Laporan (Reports) dan Ekspor data.
 */

export async function getAllReports(limit = 10, page = 1, month = null, year = null) {
  const offset = (page - 1) * limit;
  
  let whereClause = ' WHERE 1=1';
  const params = [];
  let paramIdx = 1;

  if (month && month !== 'all') {
    whereClause += ` AND EXTRACT(MONTH FROM r.generated_at) = $${paramIdx}`;
    params.push(parseInt(month));
    paramIdx++;
  }

  if (year && year !== 'all') {
    whereClause += ` AND EXTRACT(YEAR FROM r.generated_at) = $${paramIdx}`;
    params.push(parseInt(year));
    paramIdx++;
  }

  // 1. Get total count for pagination
  const countQuery = `SELECT COUNT(*) FROM reports r ${whereClause}`;
  const countResult = await query(countQuery, params);
  const totalCount = parseInt(countResult[0].count);

  // 2. Get paginated results
  const queryStr = `
    SELECT 
      r.id_report,
      r.file_name,
      r.generated_at,
      r.total_attacks,
      r.generated_by,
      u.username as generated_by_user
    FROM reports r
    LEFT JOIN users u ON r.generated_by = u.id_user
    ${whereClause}
    ORDER BY r.generated_at DESC 
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;
  
  const finalParams = [...params, limit, offset];
  const rows = await query(queryStr, finalParams);

  return {
    rows,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function createReportRecord({ fileName, totalAttacks, generatedBy = null }) {
  const result = await query(
    `INSERT INTO reports (file_name, total_attacks, generated_by)
     VALUES ($1, $2, $3)
     RETURNING id_report, generated_at`,
    [fileName, totalAttacks, generatedBy]
  );
  return result[0];
}

export async function generateReportExcel(reportId) {
  // 1. Get report info
  const reportResults = await query(
    `SELECT id_report, file_name, total_attacks FROM reports WHERE id_report = $1`,
    [parseInt(reportId)]
  );

  if (!reportResults || reportResults.length === 0) {
    throw new Error('Laporan tidak ditemukan');
  }

  const report = reportResults[0];

  // 2. Get detailed notifications & logs
  const detailedResults = await query(
    `SELECT 
        m.attack_type, m.is_anomaly,
        pl.ip_address, pl.timestamp, pl.method, pl.request_url, pl.http_version, pl.status_code, pl.bytes_sent, pl.referrer, pl.user_agent
      FROM notifications n
      LEFT JOIN machine_learning_results m ON n.id_ml_result = m.id_ml_result
      LEFT JOIN parsed_logs pl ON m.id_parsed = pl.id_parsed
      WHERE n.id_report = $1 AND n.notification_type = 'Attack Alert'
      ORDER BY n.created_at DESC`,
    [parseInt(reportId)]
  );

  // 3. Transform data
  const dataForExport = detailedResults.map((row, index) => {
    let fullLog = '-';
    if (row.ip_address && row.timestamp) {
        const ts = new Date(row.timestamp).toISOString();
        fullLog = `${row.ip_address} - - [${ts}] "${row.method} ${row.request_url} HTTP/${row.http_version || '1.1'}" ${row.status_code || '-'} ${row.bytes_sent || '-'} "${row.referrer || '-'}" "${row.user_agent || '-'}"`;
    }
    return {
      'No': index + 1,
      'Log Lengkap': fullLog,
      'Tipe Serangan': row.attack_type || '-',
      'Status': row.is_anomaly ? 'Anomali' : 'Normal',
    };
  });

  // 4. Generate XLSX Buffer
  const workbook = XLSX.utils.book_new();
  const dataSheet = XLSX.utils.json_to_sheet(dataForExport);
  dataSheet['!cols'] = [{ wch: 8 }, { wch: 120 }, { wch: 20 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(workbook, dataSheet, 'Laporan Serangan');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  
  return {
    buffer,
    fileName: report.file_name || `report_${reportId}.xlsx`
  };
}
