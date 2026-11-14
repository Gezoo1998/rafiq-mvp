import { eq, and, sql, gte, lte, desc } from "drizzle-orm";
import { db } from "../client";
import { aiUsage, auditLog, schools, sessions, users } from "../schema";
import { Actor } from "@/lib/auth/guards";

export async function logAudit(params: {
  schoolId?: string | null;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta?: any;
}) {
  try {
    await db.insert(auditLog).values({
      schoolId: params.schoolId || null,
      actorId: params.actorId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      meta: params.meta || null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function getSystemUsage(
  actor: Actor,
  params?: {
    schoolId?: string;
    from?: Date;
    to?: Date;
  }
) {
  if (actor.role !== "system_admin") {
    throw new Error("System admin role required for system usage");
  }

  const conditions = [];
  if (params?.schoolId) conditions.push(eq(aiUsage.schoolId, params.schoolId));
  if (params?.from) conditions.push(gte(aiUsage.createdAt, params.from));
  if (params?.to) conditions.push(lte(aiUsage.createdAt, params.to));

  const rows = await db
    .select({
      schoolId: aiUsage.schoolId,
      tokensIn: sql<number>`sum(${aiUsage.tokensIn})::int`,
      tokensOut: sql<number>`sum(${aiUsage.tokensOut})::int`,
      totalCalls: sql<number>`count(*)::int`,
      errorCount: sql<number>`count(case when ${aiUsage.status} != 'ok' then 1 end)::int`,
    })
    .from(aiUsage)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(aiUsage.schoolId);

  const schoolRows = await db.select().from(schools);
  const schoolMap = new Map(schoolRows.map((s) => [s.id, s]));

  const inputCostRate = parseFloat(process.env.AI_COST_PER_1M_INPUT_TOKENS_USD || "0.59");
  const outputCostRate = parseFloat(process.env.AI_COST_PER_1M_OUTPUT_TOKENS_USD || "0.79");

  return rows.map((r) => {
    const school = schoolMap.get(r.schoolId);
    const inTokens = r.tokensIn || 0;
    const outTokens = r.tokensOut || 0;
    const estimatedCostUsd =
      (inTokens / 1_000_000) * inputCostRate + (outTokens / 1_000_000) * outputCostRate;

    return {
      schoolId: r.schoolId,
      schoolName: school?.name || "Unknown School",
      city: school?.city || "",
      tokensIn: inTokens,
      tokensOut: outTokens,
      totalCalls: r.totalCalls,
      errorCount: r.errorCount,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(4)),
    };
  });
}

export async function getSchoolDashboard(actor: Actor) {
  const schoolId = actor.schoolId;
  if (!schoolId) throw new Error("School ID required");

  // Counts of students, teachers, classes
  const studentCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.schoolId, schoolId), eq(users.role, "student")));

  const teacherCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.schoolId, schoolId), eq(users.role, "teacher")));

  // Active users in 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activeUsers = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.schoolId, schoolId), gte(users.lastLoginAt, sevenDaysAgo)));

  // Safety flagged sessions
  const flaggedSessions = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.schoolId, schoolId), eq(sessions.safetyFlag, true)))
    .orderBy(desc(sessions.createdAt));

  // Today's token usage vs cap
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const tokensTodayRes = await db
    .select({
      tokens: sql<number>`coalesce(sum(${aiUsage.tokensIn} + ${aiUsage.tokensOut}), 0)::int`,
    })
    .from(aiUsage)
    .where(and(eq(aiUsage.schoolId, schoolId), gte(aiUsage.createdAt, startOfToday)));

  const school = await db.select().from(schools).where(eq(schools.id, schoolId)).limit(1);

  return {
    studentCount: studentCount[0]?.count ?? 0,
    teacherCount: teacherCount[0]?.count ?? 0,
    activeUsers7d: activeUsers[0]?.count ?? 0,
    tokensUsedToday: tokensTodayRes[0]?.tokens ?? 0,
    dailyTokenCap: school[0]?.aiDailyTokenCap ?? 2000000,
    safetyAlerts: flaggedSessions,
  };
}
