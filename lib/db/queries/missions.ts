import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { db } from "../client";
import {
  missions,
  missionTargets,
  assignments,
  classes,
  classStudents,
  users,
  sessions,
  evaluations,
  messages,
} from "../schema";
import { Actor } from "@/lib/auth/guards";

export async function getMissions(
  actor: Actor,
  filter?: {
    status?: "draft" | "published" | "closed";
    subject?: "math" | "science" | "english";
  }
) {
  const schoolId = actor.role === "system_admin" ? (actor.schoolId || undefined) : actor.schoolId;
  if (!schoolId && actor.role !== "system_admin") return [];

  const conditions = [];
  if (schoolId) conditions.push(eq(missions.schoolId, schoolId));
  if (actor.role === "teacher") conditions.push(eq(missions.teacherId, actor.userId));
  if (filter?.status) conditions.push(eq(missions.status, filter.status));
  if (filter?.subject) conditions.push(eq(missions.subject, filter.subject));

  return await db
    .select({
      id: missions.id,
      title: missions.title,
      instructions: missions.instructions,
      subject: missions.subject,
      grade: missions.grade,
      curriculum: missions.curriculum,
      languageMode: missions.languageMode,
      dueAt: missions.dueAt,
      status: missions.status,
      publishedAt: missions.publishedAt,
      closedAt: missions.closedAt,
      updatedAt: missions.updatedAt,
      createdAt: missions.createdAt,
      teacherId: missions.teacherId,
    })
    .from(missions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(missions.createdAt));
}

export async function getMissionById(actor: Actor, id: string) {
  const conditions = [eq(missions.id, id)];
  if (actor.role !== "system_admin" && actor.schoolId) {
    conditions.push(eq(missions.schoolId, actor.schoolId));
  }

  const rows = await db
    .select()
    .from(missions)
    .where(and(...conditions))
    .limit(1);

  if (!rows.length) return null;
  const mission = rows[0];

  // Also fetch targets
  const targets = await db
    .select()
    .from(missionTargets)
    .where(eq(missionTargets.missionId, id));

  return { ...mission, targets };
}

export async function createMission(
  actor: Actor,
  data: {
    title: string;
    instructions?: string | null;
    subject: "math" | "science" | "english";
    grade: number;
    curriculum: "american" | "cambridge";
    languageMode: "en" | "ar" | "mixed";
    dueAt: Date;
    targets: { classId?: string; studentId?: string }[];
  }
) {
  if (!actor.schoolId) throw new Error("School ID required");
  if (data.title.length > 120) throw new Error("Title must be 120 characters or less");
  if (data.instructions && data.instructions.length > 2000) {
    throw new Error("Instructions must be 2000 characters or less");
  }

  // Verify all target classes/students match grade and curriculum
  for (const target of data.targets) {
    if (target.classId) {
      const cls = await db
        .select()
        .from(classes)
        .where(and(eq(classes.id, target.classId), eq(classes.schoolId, actor.schoolId)))
        .limit(1);
      if (!cls[0]) throw new Error(`Target class not found: ${target.classId}`);
      if (cls[0].grade !== data.grade || cls[0].curriculum !== data.curriculum) {
        throw new Error(
          `Class ${cls[0].name} (Grade ${cls[0].grade} ${cls[0].curriculum}) does not match mission Grade ${data.grade} ${data.curriculum}`
        );
      }
    }
    if (target.studentId) {
      const stu = await db
        .select()
        .from(users)
        .where(and(eq(users.id, target.studentId), eq(users.schoolId, actor.schoolId)))
        .limit(1);
      if (!stu[0]) throw new Error(`Target student not found: ${target.studentId}`);
      if (stu[0].grade !== data.grade || stu[0].curriculum !== data.curriculum) {
        throw new Error(
          `Student ${stu[0].fullName} does not match mission grade/curriculum`
        );
      }
    }
  }

  const missionRows = await db
    .insert(missions)
    .values({
      schoolId: actor.schoolId,
      teacherId: actor.userId,
      title: data.title.trim(),
      instructions: data.instructions?.trim() || null,
      subject: data.subject,
      grade: data.grade,
      curriculum: data.curriculum,
      languageMode: data.languageMode,
      dueAt: data.dueAt,
      status: "draft",
    })
    .returning();

  const newMission = missionRows[0];

  // Insert targets
  if (data.targets.length > 0) {
    await db.insert(missionTargets).values(
      data.targets.map((t) => ({
        missionId: newMission.id,
        classId: t.classId || null,
        studentId: t.studentId || null,
      }))
    );
  }

  return newMission;
}

export async function publishMission(actor: Actor, missionId: string) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) throw new Error("Mission not found");
  if (mission.status === "published") return mission; // idempotent

  // Find all reachable students from targets
  const studentIds = new Set<string>();

  for (const target of mission.targets) {
    if (target.studentId) {
      studentIds.add(target.studentId);
    }
    if (target.classId) {
      const enrolled = await db
        .select({ studentId: classStudents.studentId })
        .from(classStudents)
        .where(eq(classStudents.classId, target.classId));
      for (const row of enrolled) {
        studentIds.add(row.studentId);
      }
    }
  }

  if (studentIds.size === 0) {
    throw new Error("Cannot publish a mission with no target students");
  }

  // Snapshot assignments
  for (const studentId of studentIds) {
    await db
      .insert(assignments)
      .values({
        missionId: mission.id,
        studentId,
        schoolId: mission.schoolId,
        status: "not_started",
      })
      .onConflictDoNothing();
  }

  const updated = await db
    .update(missions)
    .set({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId))
    .returning();

  return updated[0];
}

export async function closeMission(actor: Actor, missionId: string) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) throw new Error("Mission not found");

  const updated = await db
    .update(missions)
    .set({
      status: "closed",
      closedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId))
    .returning();

  return updated[0];
}

export async function reopenMission(actor: Actor, missionId: string) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) throw new Error("Mission not found");

  const updated = await db
    .update(missions)
    .set({
      status: "published",
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId))
    .returning();

  return updated[0];
}

export async function updateMission(
  actor: Actor,
  missionId: string,
  data: Partial<{
    title: string;
    instructions: string | null;
    dueAt: Date;
    languageMode: "en" | "ar" | "mixed";
  }>
) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) throw new Error("Mission not found");

  // Check rule: If published and any student has started, title/instructions are locked
  if (mission.status !== "draft") {
    const started = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(assignments)
      .where(and(eq(assignments.missionId, missionId), sql`${assignments.status} != 'not_started'`));

    if ((started[0]?.count ?? 0) > 0) {
      if (data.title && data.title !== mission.title) {
        throw new Error("Cannot edit mission title once students have started");
      }
      if (data.instructions !== undefined && data.instructions !== mission.instructions) {
        throw new Error("Cannot edit instructions once students have started");
      }
    }
  }

  const updated = await db
    .update(missions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(missions.id, missionId))
    .returning();

  return updated[0];
}

export async function deleteMission(actor: Actor, missionId: string) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) throw new Error("Mission not found");
  if (mission.status !== "draft") {
    throw new Error("Only draft missions can be deleted");
  }

  await db.delete(missions).where(eq(missions.id, missionId));
  return { success: true };
}

export async function getMissionResults(actor: Actor, missionId: string) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) return null;

  // Fetch all assignments with student info and latest evaluation
  const assignmentRows = await db
    .select({
      assignmentId: assignments.id,
      studentId: assignments.studentId,
      studentName: users.fullName,
      status: assignments.status,
      startedAt: assignments.startedAt,
      completedAt: assignments.completedAt,
      resetCount: assignments.resetCount,
    })
    .from(assignments)
    .innerJoin(users, eq(assignments.studentId, users.id))
    .where(eq(assignments.missionId, missionId));

  const assignmentIds = assignmentRows.map((r) => r.assignmentId);

  // Fetch evaluations for these assignments
  const evals = assignmentIds.length > 0
    ? await db
        .select()
        .from(evaluations)
        .where(and(inArray(evaluations.assignmentId, assignmentIds), eq(evaluations.status, "ok")))
        .orderBy(desc(evaluations.createdAt))
    : [];

  const evalMap = new Map<string, typeof evals[0]>();
  for (const ev of evals) {
    if (!evalMap.has(ev.assignmentId)) {
      evalMap.set(ev.assignmentId, ev);
    }
  }

  // Fetch active sessions for hints/safety
  const sessionRows = assignmentIds.length > 0
    ? await db
        .select()
        .from(sessions)
        .where(inArray(sessions.assignmentId, assignmentIds))
    : [];

  const sessionMap = new Map<string, typeof sessionRows[0]>();
  for (const s of sessionRows) {
    sessionMap.set(s.assignmentId, s);
  }

  // Compute stats
  const totalAssigned = assignmentRows.length;
  const startedCount = assignmentRows.filter((a) => a.status !== "not_started").length;
  const completedCount = assignmentRows.filter((a) => a.status === "completed").length;

  let totalScore = 0;
  let scoredCount = 0;
  const levelCounts = {
    mastered: 0,
    proficient: 0,
    developing: 0,
    needs_support: 0,
  };

  const gapCounts: Record<string, { tag: string; description: string; count: number }> = {};

  const studentsList = assignmentRows.map((row) => {
    const ev = evalMap.get(row.assignmentId);
    const sess = sessionMap.get(row.assignmentId);

    if (ev && ev.masteryScore !== null) {
      totalScore += ev.masteryScore;
      scoredCount++;
      if (ev.level) {
        levelCounts[ev.level] = (levelCounts[ev.level] || 0) + 1;
      }
      if (ev.gaps && Array.isArray(ev.gaps)) {
        for (const g of ev.gaps) {
          if (!gapCounts[g.tag]) {
            gapCounts[g.tag] = { tag: g.tag, description: g.description, count: 0 };
          }
          gapCounts[g.tag].count++;
        }
      }
    }

    return {
      assignmentId: row.assignmentId,
      studentId: row.studentId,
      studentName: row.studentName,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      score: ev?.masteryScore ?? null,
      level: ev?.level ?? null,
      hintsUsed: ev?.hintsUsed ?? 0,
      safetyFlag: sess?.safetyFlag ?? false,
      evaluationId: ev?.id ?? null,
      teacherSummary: ev?.teacherSummary ?? null,
    };
  });

  const averageScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;
  const commonGaps = Object.values(gapCounts).sort((a, b) => b.count - a.count);

  return {
    mission,
    stats: {
      assigned: totalAssigned,
      started: startedCount,
      completed: completedCount,
      averageScore,
      levelCounts,
    },
    commonGaps,
    students: studentsList,
  };
}

export async function getMissionStudentDrillDown(
  actor: Actor,
  missionId: string,
  studentId: string
) {
  const mission = await getMissionById(actor, missionId);
  if (!mission) return null;

  const assignment = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.missionId, missionId), eq(assignments.studentId, studentId)))
    .limit(1);

  if (!assignment[0]) return null;

  const session = await db
    .select()
    .from(sessions)
    .where(eq(sessions.assignmentId, assignment[0].id))
    .orderBy(desc(sessions.createdAt))
    .limit(1);

  let messageList: any[] = [];
  if (session[0]) {
    messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, session[0].id))
      .orderBy(messages.id);
  }

  const evaluation = await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.assignmentId, assignment[0].id))
    .orderBy(desc(evaluations.createdAt))
    .limit(1);

  const studentUser = await db
    .select({ id: users.id, fullName: users.fullName, grade: users.grade, curriculum: users.curriculum })
    .from(users)
    .where(eq(users.id, studentId))
    .limit(1);

  return {
    mission,
    assignment: assignment[0],
    student: studentUser[0] || null,
    session: session[0] || null,
    messages: messageList,
    evaluation: evaluation[0] || null,
  };
}

