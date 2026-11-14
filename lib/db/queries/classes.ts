import { eq, and, sql } from "drizzle-orm";
import { db } from "../client";
import { classes, classStudents, classTeachers, users } from "../schema";
import { Actor } from "@/lib/auth/guards";

export async function getClasses(actor: Actor) {
  const schoolId = actor.role === "system_admin" ? (actor.schoolId || undefined) : actor.schoolId;
  if (!schoolId && actor.role !== "system_admin") return [];

  const conditions = [];
  if (schoolId) {
    conditions.push(eq(classes.schoolId, schoolId));
  }

  // If teacher, optionally can query assigned classes
  if (actor.role === "teacher") {
    const teacherClasses = db
      .select({ classId: classTeachers.classId })
      .from(classTeachers)
      .where(eq(classTeachers.teacherId, actor.userId));

    conditions.push(sql`${classes.id} IN (${teacherClasses})`);
  }

  return await db
    .select()
    .from(classes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(classes.grade, classes.name);
}

export async function getClassById(actor: Actor, id: string) {
  const conditions = [eq(classes.id, id)];
  if (actor.role !== "system_admin" && actor.schoolId) {
    conditions.push(eq(classes.schoolId, actor.schoolId));
  }

  const rows = await db
    .select()
    .from(classes)
    .where(and(...conditions))
    .limit(1);

  return rows[0] || null;
}

export async function createClass(
  actor: Actor,
  data: {
    schoolId?: string;
    name: string;
    grade: number;
    curriculum: "american" | "cambridge";
    academicYear?: string;
  }
) {
  const schoolId = actor.role === "system_admin" ? (data.schoolId || actor.schoolId) : actor.schoolId;
  if (!schoolId) throw new Error("School ID required");

  const rows = await db
    .insert(classes)
    .values({
      schoolId,
      name: data.name,
      grade: data.grade,
      curriculum: data.curriculum,
      academicYear: data.academicYear || "2026-2027",
    })
    .returning();

  return rows[0];
}

export async function updateClass(
  actor: Actor,
  id: string,
  data: Partial<{
    name: string;
    grade: number;
    curriculum: "american" | "cambridge";
    academicYear: string;
  }>
) {
  const existing = await getClassById(actor, id);
  if (!existing) return null;

  const rows = await db
    .update(classes)
    .set(data)
    .where(eq(classes.id, id))
    .returning();

  return rows[0] || null;
}

export async function deleteClass(actor: Actor, id: string) {
  const existing = await getClassById(actor, id);
  if (!existing) return { success: false, error: "Class not found" };

  // Check if class has students
  const studentCountRes = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(classStudents)
    .where(eq(classStudents.classId, id));

  if ((studentCountRes[0]?.count ?? 0) > 0) {
    return { success: false, error: "Cannot delete class with enrolled students" };
  }

  await db.delete(classes).where(eq(classes.id, id));
  return { success: true };
}

export async function setClassTeachers(
  actor: Actor,
  classId: string,
  teachers: { teacherId: string; subject: "math" | "science" | "english" }[]
) {
  const existing = await getClassById(actor, classId);
  if (!existing) throw new Error("Class not found");

  // Replace existing teachers for this class
  await db.delete(classTeachers).where(eq(classTeachers.classId, classId));

  if (teachers.length > 0) {
    await db.insert(classTeachers).values(
      teachers.map((t) => ({
        classId,
        teacherId: t.teacherId,
        subject: t.subject,
      }))
    );
  }
}

export async function getClassStudents(actor: Actor, classId: string) {
  const existing = await getClassById(actor, classId);
  if (!existing) return [];

  return await db
    .select({
      id: users.id,
      fullName: users.fullName,
      externalId: users.externalId,
      grade: users.grade,
      curriculum: users.curriculum,
      codeLast4: users.codeLast4,
      status: users.status,
    })
    .from(users)
    .innerJoin(classStudents, eq(users.id, classStudents.studentId))
    .where(eq(classStudents.classId, classId))
    .orderBy(users.fullName);
}
