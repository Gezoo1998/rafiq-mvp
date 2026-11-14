import { eq, and, sql, ilike, or } from "drizzle-orm";
import { db } from "../client";
import { users, schools, classStudents, classTeachers } from "../schema";
import { Actor } from "@/lib/auth/guards";

export async function getUsers(
  actor: Actor,
  filter?: {
    role?: "student" | "teacher" | "school_admin";
    classId?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const schoolId = actor.role === "system_admin" ? (actor.schoolId || undefined) : actor.schoolId;
  if (!schoolId && actor.role !== "system_admin") return [];

  const conditions = [];

  if (schoolId) {
    conditions.push(eq(users.schoolId, schoolId));
  }

  if (filter?.role) {
    conditions.push(eq(users.role, filter.role));
  }

  if (filter?.status) {
    conditions.push(eq(users.status, filter.status));
  }

  if (filter?.search) {
    const q = `%${filter.search.trim()}%`;
    conditions.push(
      or(
        ilike(users.fullName, q),
        ilike(users.externalId, q),
        ilike(users.codeLast4, q)
      )
    );
  }

  if (filter?.classId) {
    // Join with class_students or class_teachers
    const studentUserIds = db
      .select({ id: classStudents.studentId })
      .from(classStudents)
      .where(eq(classStudents.classId, filter.classId));

    conditions.push(sql`${users.id} IN (${studentUserIds})`);
  }

  return await db
    .select({
      id: users.id,
      schoolId: users.schoolId,
      role: users.role,
      fullName: users.fullName,
      externalId: users.externalId,
      grade: users.grade,
      curriculum: users.curriculum,
      preferredLanguage: users.preferredLanguage,
      codeLast4: users.codeLast4,
      status: users.status,
      consentStatus: users.consentStatus,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(filter?.limit ?? 100)
    .offset(filter?.offset ?? 0);
}

export async function getUserById(actor: Actor, id: string) {
  const conditions = [eq(users.id, id)];
  if (actor.role !== "system_admin" && actor.schoolId) {
    conditions.push(eq(users.schoolId, actor.schoolId));
  }

  const rows = await db
    .select({
      id: users.id,
      schoolId: users.schoolId,
      role: users.role,
      fullName: users.fullName,
      externalId: users.externalId,
      grade: users.grade,
      curriculum: users.curriculum,
      preferredLanguage: users.preferredLanguage,
      codeLast4: users.codeLast4,
      status: users.status,
      consentStatus: users.consentStatus,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(...conditions))
    .limit(1);

  return rows[0] || null;
}

export async function getUserByCodeHmac(codeHmac: string) {
  const rows = await db
    .select({
      user: users,
      school: schools,
    })
    .from(users)
    .leftJoin(schools, eq(users.schoolId, schools.id))
    .where(eq(users.codeHmac, codeHmac))
    .limit(1);

  if (!rows.length) return null;
  return rows[0];
}

export async function updateLastLogin(userId: string) {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}

export async function createUser(
  actor: Actor,
  data: {
    schoolId?: string | null;
    role: "student" | "teacher" | "school_admin" | "system_admin";
    fullName: string;
    externalId?: string | null;
    grade?: number | null;
    curriculum?: "american" | "cambridge" | null;
    preferredLanguage?: "en" | "ar" | "mixed" | null;
    codeHmac: string;
    codeLast4: string;
    classIds?: string[];
    subjects?: ("math" | "science" | "english")[];
  }
) {
  const targetSchoolId = actor.role === "system_admin" ? (data.schoolId || null) : actor.schoolId;

  if (data.role !== "system_admin" && !targetSchoolId) {
    throw new Error("School ID required for non-system admin user");
  }

  const rows = await db
    .insert(users)
    .values({
      schoolId: targetSchoolId,
      role: data.role,
      fullName: data.fullName,
      externalId: data.externalId || null,
      grade: data.grade || null,
      curriculum: data.curriculum || null,
      preferredLanguage: data.preferredLanguage || null,
      codeHmac: data.codeHmac,
      codeLast4: data.codeLast4,
      status: "active",
      consentStatus: "not_required_demo",
      createdBy: actor.userId,
    })
    .returning();

  const newUser = rows[0];

  // If student and classIds provided, link to classes
  if (data.role === "student" && data.classIds?.length) {
    for (const classId of data.classIds) {
      await db.insert(classStudents).values({
        classId,
        studentId: newUser.id,
      }).onConflictDoNothing();
    }
  }

  // If teacher and classIds & subjects provided, link to class_teachers
  if (data.role === "teacher" && data.classIds?.length && data.subjects?.length) {
    for (const classId of data.classIds) {
      for (const subject of data.subjects) {
        await db.insert(classTeachers).values({
          classId,
          teacherId: newUser.id,
          subject,
        }).onConflictDoNothing();
      }
    }
  }

  return newUser;
}

export async function updateUser(
  actor: Actor,
  id: string,
  data: Partial<{
    fullName: string;
    externalId: string | null;
    grade: number | null;
    curriculum: "american" | "cambridge" | null;
    preferredLanguage: "en" | "ar" | "mixed" | null;
    status: "active" | "inactive";
  }>
) {
  const target = await getUserById(actor, id);
  if (!target) return null;

  const rows = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();

  return rows[0] || null;
}

export async function deactivateUser(actor: Actor, id: string) {
  return await updateUser(actor, id, { status: "inactive" });
}

export async function activateUser(actor: Actor, id: string) {
  return await updateUser(actor, id, { status: "active" });
}

export async function regenerateUserCode(
  actor: Actor,
  id: string,
  newCodeHmac: string,
  newCodeLast4: string
) {
  const target = await getUserById(actor, id);
  if (!target) return null;

  const rows = await db
    .update(users)
    .set({
      codeHmac: newCodeHmac,
      codeLast4: newCodeLast4,
    })
    .where(eq(users.id, id))
    .returning();

  return rows[0] || null;
}
