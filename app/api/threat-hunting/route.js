/**
 * API Route for Threat Hunting (Logs Table)
 */

import { getThreatHuntingLogs } from '@/lib/services/threatService';

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all";
    const searchQuery = searchParams.get("q") || "";
    const onlyThreats = searchParams.get("onlyThreats") === "true";
    const limit = parseInt(searchParams.get("limit")) || 1000;

    const formattedLogs = await getThreatHuntingLogs({ range, limit, searchQuery, onlyThreats });

    return Response.json({
      success: true,
      data: formattedLogs,
    });
  } catch (error) {
    console.error("Error in threat hunting API:", error);
    return Response.json(
      { error: "Gagal mengambil data log: " + error.message },
      { status: 500 },
    );
  }
}
