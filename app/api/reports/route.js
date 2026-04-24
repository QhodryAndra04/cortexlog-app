/**
 * GET /api/reports
 */

import { getAllReports } from '@/lib/services/reportService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const result = await getAllReports(limit, page, month, year);

    return Response.json({
      success: true,
      data: result.rows,
      pagination: {
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching reports API:', error);
    return Response.json({ error: 'Gagal mengambil laporan' }, { status: 500 });
  }
}

// POST is currently handled by analyze-logs directly or manually, 
// keeping it here for consistency if needed from UI.
