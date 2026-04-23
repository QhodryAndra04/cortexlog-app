/**
 * GET /api/reports
 */

import { getAllReports } from '@/lib/services/reportService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const results = await getAllReports(limit, month, year);

    return Response.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching reports API:', error);
    return Response.json({ error: 'Gagal mengambil laporan' }, { status: 500 });
  }
}

// POST is currently handled by analyze-logs directly or manually, 
// keeping it here for consistency if needed from UI.
