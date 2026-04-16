'use server';

import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: 'Report ID harus diisi' },
        { status: 400 }
      );
    }

    // Get report info
    const reportResults = await query(
      `SELECT id_report, file_name, generated_at, total_attacks 
       FROM reports 
       WHERE id_report = $1`,
      [parseInt(id)]
    );

    if (!reportResults || reportResults.length === 0) {
      return Response.json(
        { error: 'Laporan tidak ditemukan' },
        { status: 404 }
      );
    }

    const report = reportResults[0];

    // Get detailed notifications with ML results and logs
    const detailedResults = await query(
      `SELECT 
        n.id_notification,
        n.id_ml_result,
        m.attack_type,
        m.is_anomaly,
        
        pl.ip_address,
        pl.timestamp,
        pl.method,
        pl.request_url,
        pl.http_version,
        pl.status_code,
        pl.bytes_sent,
        pl.referrer,
        pl.user_agent
        
      FROM notifications n
      LEFT JOIN machine_learning_results m ON n.id_ml_result = m.id_ml_result
      LEFT JOIN parsed_logs pl ON m.id_parsed = pl.id_parsed
      WHERE n.id_report = $1 AND n.notification_type = 'Attack Alert'
      ORDER BY n.created_at DESC`,
      [parseInt(id)]
    );

    // Transform data untuk export dengan format Apache log lengkap
    const dataForExport = detailedResults.map((row, index) => {
      // Format Apache log: IP - - [timestamp] "METHOD /path HTTP/version" status size "referrer" "user_agent"
      let fullLog = '-';
      
      if (row.ip_address && row.timestamp && row.method && row.request_url) {
        const timestamp = new Date(row.timestamp).toLocaleString('id-ID', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
        
        fullLog = `${row.ip_address} - - [${timestamp}] "${row.method} ${row.request_url} HTTP/${row.http_version || '1.1'}" ${row.status_code || '-'} ${row.bytes_sent || '-'} "${row.referrer || '-'}" "${row.user_agent || '-'}"`;
      }
      
      const anomalyStatus = row.is_anomaly ? 'Anomali' : 'Normal';
      
      return {
        'No': index + 1,
        'Log Lengkap': fullLog,
        'Tipe Serangan': row.attack_type || '-',
        'Status': anomalyStatus,
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create main sheet
    const dataSheet = XLSX.utils.json_to_sheet(dataForExport);
    
    // Set column widths
    dataSheet['!cols'] = [
      { wch: 8 },      // No
      { wch: 120 },    // Log Lengkap (wide untuk full log)
      { wch: 20 },     // Tipe Serangan
      { wch: 12 },     // Status
    ];
    
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'Laporan Serangan');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    // Return as file download
    const fileName = report.file_name || 'attack_analysis_report.xlsx';
    const headers_response = {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    };

    return new Response(excelBuffer, {
      headers: headers_response,
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    return Response.json(
      { error: 'Gagal export laporan: ' + error.message },
      { status: 500 }
    );
  }
}
