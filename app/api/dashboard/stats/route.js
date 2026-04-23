/**
 * GET /api/dashboard/stats
 * Handler untuk mengambil data statistik dashboard.
 * Versi Refaktor: Menggunakan dashboardService.js
 */

import { getDashboardStats } from '@/lib/services/dashboardService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';

    const stats = await getDashboardStats(range);

    return Response.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats API:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
