'use server';

import { query } from '@/lib/db';

// GET - Retrieve all reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;

    const results = await query(
      `SELECT 
        r.id_report,
        r.file_name,
        r.generated_at,
        r.total_attacks,
        r.generated_by,
        u.username as generated_by_user
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id_user
      ORDER BY r.generated_at DESC
      LIMIT $1`,
      [limit]
    );

    return Response.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return Response.json(
      { error: 'Gagal mengambil laporan: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create new report dari notifications
export async function POST(request) {
  try {
    const {
      fileName,
      generateBy = null,
      fromDate = null,
      toDate = null,
    } = await request.json();

    if (!fileName) {
      return Response.json(
        { error: 'File name harus diisi' },
        { status: 400 }
      );
    }

    // Get attack alerts count
    let countQuery = `SELECT COUNT(*) as total FROM notifications WHERE notification_type = 'Attack Alert'`;
    const countParams = [];

    if (fromDate) {
      countQuery += ` AND created_at >= $${countParams.length + 1}`;
      countParams.push(fromDate);
    }

    if (toDate) {
      countQuery += ` AND created_at <= $${countParams.length + 1}`;
      countParams.push(toDate);
    }

    const countResult = await query(countQuery, countParams);
    const totalAttacks = countResult[0]?.total || 0;

    // Insert new report
    const insertResult = await query(
      `INSERT INTO reports (file_name, total_attacks, generated_by)
       VALUES ($1, $2, $3)
       RETURNING id_report, generated_at`,
      [fileName, totalAttacks, generateBy || null]
    );

    const reportId = insertResult[0].id_report;
    const generatedAt = insertResult[0].generated_at;

    return Response.json({
      success: true,
      data: {
        id_report: reportId,
        file_name: fileName,
        total_attacks: totalAttacks,
        generated_at: generatedAt,
      },
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return Response.json(
      { error: 'Gagal membuat laporan: ' + error.message },
      { status: 500 }
    );
  }
}
