import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { schools } from "../schema";
import { Actor } from "@/lib/auth/guards";

export async function getSchools(actor: Actor) {
  if (actor.role !== "system_admin") {
    if (!actor.schoolId) return [];
    return await db.select().from(schools).where(eq(schools.id, actor.schoolId));
  }
  return await db.select().from(schools).orderBy(desc(schools.createdAt));
}

export async function getSchoolById(actor: Actor, id: string) {
  if (actor.role !== "system_admin" && actor.schoolId !== id) {
    return null;
  }
  const rows = await db.select().from(schools).where(eq(schools.id, id)).limit(1);
  return rows[0] || null;
}

export async function createSchool(
  actor: Actor,
  data: {
    name: string;
    city: string;
    defaultLanguageMode: "en" | "ar" | "mixed";
    aiDailyTokenCap?: number;
  }
) {
  if (actor.role !== "system_admin") {
    throw new Error("Only System Admin can create schools");
  }
  const rows = await db
    .insert(schools)
    .values({
      name: data.name,
      city: data.city,
      defaultLanguageMode: data.defaultLanguageMode,
      aiDailyTokenCap: data.aiDailyTokenCap ?? 2000000,
      isActive: true,
    })
    .returning();
  return rows[0];
}

export async function updateSchool(
  actor: Actor,
  id: string,
  data: Partial<{
    name: string;
    city: string;
    defaultLanguageMode: "en" | "ar" | "mixed";
    aiDailyTokenCap: number;
    isActive: boolean;
  }>
) {
  if (actor.role !== "system_admin") {
    throw new Error("Only System Admin can update schools");
  }
  const rows = await db
    .update(schools)
    .set(data)
    .where(eq(schools.id, id))
    .returning();
  return rows[0] || null;
}

