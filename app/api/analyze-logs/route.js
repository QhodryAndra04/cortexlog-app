/**
 * POST /api/analyze-logs
 * Endpoint utama untuk ingestion log (dari Agent).
 * Versi Refaktor Akhir: Menggunakan processDetectionBatch dari detectionService
 */

'use server';

import { parseApacheLog, buildIpStats } from '@/lib/services/logProcessor';
import { detectAnomaliesBatch, processDetectionBatch } from '@/lib/services/detectionService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { rawLogs, userId = null } = body;

    if (!rawLogs || typeof rawLogs !== 'string') {
      return Response.json({ error: 'Field "rawLogs" harus berupa string.' }, { status: 400 });
    }

    // 1. Parsing Log
    const lines = rawLogs.split('\n').filter(l => l.trim().length > 0);
    const parsedLogs = lines.map(parseApacheLog).filter(Boolean);

    if (parsedLogs.length === 0) {
      return Response.json({ error: 'Format log tidak valid.' }, { status: 400 });
    }

    // 2. Kalkulasi Statistik & Deteksi ML (Batch)
    const ipStats = buildIpStats(parsedLogs);
    const mlBatchResponse = await detectAnomaliesBatch(parsedLogs, ipStats);

    // 3. Ingest & Process Results (Delegated to service)
    const summary = await processDetectionBatch(parsedLogs, mlBatchResponse, userId);

    return Response.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error API analyze-logs:', error);
    return Response.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
  }
}
