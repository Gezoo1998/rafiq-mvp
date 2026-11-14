import { db } from "../db/client";
import { classes, users, classStudents, classTeachers, importBatches } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { generateAccessCode } from "../auth/codes";
import { NormalizedStudent, NormalizedTeacher } from "./validate";
import { Actor } from "../auth/guards";
import { logAudit } from "../db/queries/system";

export interface GeneratedCredential {
  name: string;
  role: "Student" | "Teacher";
  class: string;
  grade: string;
  code: string;
}

export async function commitImportBatch(
  actor: Actor,
  batchId: string,
  payload: {
    students: NormalizedStudent[];
    teachers: NormalizedTeacher[];
  }
): Promise<{
  createdStudents: number;
  createdTeachers: number;
  createdClasses: number;
  credentials: GeneratedCredential[];
}> {
  const schoolId = actor.schoolId;
  if (!schoolId) throw new Error("School ID is required for import");

  const credentials: GeneratedCredential[] = [];

  // 1. Ensure all referenced classes exist
  const existingClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.schoolId, schoolId));

  const classMap = new Map<string, typeof existingClasses[0]>();
  for (const c of existingClasses) {
    classMap.set(c.name.toUpperCase(), c);
  }

  let createdClassesCount = 0;

  // Infer grade and curriculum for newly created classes from student records
  for (const s of payload.students) {
    const key = s.className.toUpperCase();
    if (!classMap.has(key)) {
      const insertedClass = await db
        .insert(classes)
        .values({
          schoolId,
          name: key,
          grade: s.grade,
          curriculum: s.curriculum,
          academicYear: "2026-2027",
        })
        .returning();
      classMap.set(key, insertedClass[0]);
      createdClassesCount++;
    }
  }

  // 2. Insert Students
  let createdStudentsCount = 0;
  for (const s of payload.students) {
    const codeData = generateAccessCode("student");

    const insertedUser = await db
      .insert(users)
      .values({
        schoolId,
        role: "student",
        fullName: s.fullName,
        externalId: s.externalId,
        grade: s.grade,
        curriculum: s.curriculum,
        preferredLanguage: s.preferredLanguage,
        codeHmac: codeData.codeHmac,
        codeLast4: codeData.codeLast4,
        status: "active",
        consentStatus: "not_required_demo",
        createdBy: actor.userId,
      })
      .returning();

    createdStudentsCount++;

    const cls = classMap.get(s.className.toUpperCase());
    if (cls) {
      await db
        .insert(classStudents)
        .values({
          classId: cls.id,
          studentId: insertedUser[0].id,
        })
        .onConflictDoNothing();
    }

    credentials.push({
      name: s.fullName,
      role: "Student",
      class: s.className,
      grade: `Grade ${s.grade}`,
      code: codeData.plainCode,
    });
  }

  // 3. Insert Teachers
  let createdTeachersCount = 0;
  for (const t of payload.teachers) {
    const codeData = generateAccessCode("teacher");

    const insertedUser = await db
      .insert(users)
      .values({
        schoolId,
        role: "teacher",
        fullName: t.fullName,
        externalId: t.externalId,
        codeHmac: codeData.codeHmac,
        codeLast4: codeData.codeLast4,
        status: "active",
        createdBy: actor.userId,
      })
      .returning();

    createdTeachersCount++;

    for (const cName of t.classes) {
      const cls = classMap.get(cName.toUpperCase());
      if (cls) {
        for (const subj of t.subjects) {
          await db
            .insert(classTeachers)
            .values({
              classId: cls.id,
              teacherId: insertedUser[0].id,
              subject: subj,
            })
            .onConflictDoNothing();
        }
      }
    }

    credentials.push({
      name: t.fullName,
      role: "Teacher",
      class: t.classes.join(", "),
      grade: "—",
      code: codeData.plainCode,
    });
  }

  // Update import_batches status
  await db
    .update(importBatches)
    .set({
      status: "committed",
      committedAt: new Date(),
    })
    .where(eq(importBatches.id, batchId));

  await logAudit({
    schoolId,
    actorId: actor.userId,
    action: "import_committed",
    entityType: "import_batch",
    entityId: batchId,
    meta: {
      studentsCount: createdStudentsCount,
      teachersCount: createdTeachersCount,
      classesCount: createdClassesCount,
    },
  });

  return {
    createdStudents: createdStudentsCount,
    createdTeachers: createdTeachersCount,
    createdClasses: createdClassesCount,
    credentials,
  };
}
