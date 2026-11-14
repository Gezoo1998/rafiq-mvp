import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "unreachable";
  let latencyMs = 0;

  try {
    const res = await db.execute(sql`SELECT 1 as healthy`);
    latencyMs = Date.now() - startTime;
    dbStatus = "connected";
  } catch (err: any) {
    console.error("Health check DB error:", err.message);
    dbStatus = "error";
  }

  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latencyMs,
      },
      aiProvider: process.env.AI_PROVIDER || "mock",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
