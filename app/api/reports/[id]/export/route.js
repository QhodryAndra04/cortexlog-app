/**
 * GET /api/reports/[id]/export
 */

import { generateReportExcel } from '@/lib/services/reportService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) return Response.json({ error: 'Report ID harus diisi' }, { status: 400 });

    const { buffer, fileName } = await generateReportExcel(id);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting report API:', error.message);
    const status = error.message === 'Laporan tidak ditemukan' ? 404 : 500;
    return Response.json({ error: error.message }, { status });
  }
}
