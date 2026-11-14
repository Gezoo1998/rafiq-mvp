import { eq, and, desc, asc, sql } from "drizzle-orm";
import { db } from "../client";
import {
  missions,
  assignments,
  sessions,
  messages,
  evaluations,
  users,
  schools,
  aiUsage,
} from "../schema";
import { Actor } from "@/lib/auth/guards";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { getAIProvider, ChatMessage } from "@/lib/ai";

export async function getStudentMissions(actor: Actor) {
  if (actor.role !== "student") throw new Error("Only students can view their missions");

  const rows = await db
    .select({
      assignmentId: assignments.id,
      assignmentStatus: assignments.status,
      startedAt: assignments.startedAt,
      completedAt: assignments.completedAt,
      missionId: missions.id,
      title: missions.title,
      instructions: missions.instructions,
      subject: missions.subject,
      grade: missions.grade,
      curriculum: missions.curriculum,
      languageMode: missions.languageMode,
      dueAt: missions.dueAt,
      missionStatus: missions.status,
    })
    .from(assignments)
    .innerJoin(missions, eq(assignments.missionId, missions.id))
    .where(and(eq(assignments.studentId, actor.userId), eq(missions.status, "published")))
    .orderBy(missions.dueAt);

  // For completed assignments, fetch the evaluation level and strengths
  const completedAssignments = rows.filter((r) => r.assignmentStatus === "completed");
  const evalMap = new Map<string, any>();

  for (const item of completedAssignments) {
    const ev = await db
      .select({
        level: evaluations.level,
        studentSummary: evaluations.studentSummary,
        strengths: evaluations.strengths,
        nextStep: evaluations.nextStep,
        masteryScore: evaluations.masteryScore,
      })
      .from(evaluations)
      .where(and(eq(evaluations.assignmentId, item.assignmentId), eq(evaluations.status, "ok")))
      .orderBy(desc(evaluations.createdAt))
      .limit(1);

    if (ev[0]) evalMap.set(item.assignmentId, ev[0]);
  }

  // Sort according to US-STU-01: due soon first, then not started, then completed
  return rows.map((r) => ({
    ...r,
    evaluation: evalMap.get(r.assignmentId) || null,
  })).sort((a, b) => {
    if (a.assignmentStatus === "completed" && b.assignmentStatus !== "completed") return 1;
    if (a.assignmentStatus !== "completed" && b.assignmentStatus === "completed") return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
}

export async function getStudentAssignment(actor: Actor, assignmentId: string) {
  const rows = await db
    .select({
      assignment: assignments,
      mission: missions,
    })
    .from(assignments)
    .innerJoin(missions, eq(assignments.missionId, missions.id))
    .where(and(eq(assignments.id, assignmentId), eq(assignments.studentId, actor.userId)))
    .limit(1);

  if (!rows[0]) return null;

  const evaluation = await db
    .select({
      level: evaluations.level,
      studentSummary: evaluations.studentSummary,
      strengths: evaluations.strengths,
      nextStep: evaluations.nextStep,
      masteryScore: evaluations.masteryScore,
      status: evaluations.status,
    })
    .from(evaluations)
    .where(eq(evaluations.assignmentId, assignmentId))
    .orderBy(desc(evaluations.createdAt))
    .limit(1);

  return {
    assignment: rows[0].assignment,
    mission: rows[0].mission,
    evaluation: evaluation[0] || null,
  };
}

export async function startOrResumeSession(actor: Actor, assignmentId: string) {
  const assignmentData = await getStudentAssignment(actor, assignmentId);
  if (!assignmentData) throw new Error("Assignment not found");

  const { assignment, mission } = assignmentData;
  if (mission.status === "closed") {
    throw new Error("This mission has been closed by your teacher");
  }

  // Check for active session
  let activeSession = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.assignmentId, assignmentId), eq(sessions.status, "active")))
    .limit(1);

  let currentSession = activeSession[0];

  if (!currentSession) {
    // Create new session
    const newSessionRows = await db
      .insert(sessions)
      .values({
        assignmentId,
        schoolId: assignment.schoolId,
        studentId: actor.userId,
        missionId: mission.id,
        status: "active",
        languageMode: mission.languageMode,
        messageCount: 0,
      })
      .returning();

    currentSession = newSessionRows[0];

    // Mark assignment as in_progress
    if (assignment.status === "not_started") {
      await db
        .update(assignments)
        .set({
          status: "in_progress",
          startedAt: new Date(),
        })
        .where(eq(assignments.id, assignmentId));
    }
  }

  // Get messages for this session
  const messageList = await db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, currentSession.id))
    .orderBy(asc(messages.id));

  return {
    sessionId: currentSession.id,
    session: currentSession,
    mission,
    messages: messageList,
  };
}

export async function resetAssignment(actor: Actor, assignmentId: string) {
  // Can be called by teacher
  const assignment = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, assignmentId))
    .limit(1);

  if (!assignment[0]) throw new Error("Assignment not found");
  if (actor.role === "teacher") {
    const mission = await db
      .select()
      .from(missions)
      .where(and(eq(missions.id, assignment[0].missionId), eq(missions.teacherId, actor.userId)))
      .limit(1);
    if (!mission[0]) throw new Error("Unauthorized to reset this mission assignment");
  }

  // Archive existing sessions
  await db
    .update(sessions)
    .set({ status: "archived" })
    .where(eq(sessions.assignmentId, assignmentId));

  // Reset assignment status
  const updated = await db
    .update(assignments)
    .set({
      status: "not_started",
      startedAt: null,
      completedAt: null,
      resetCount: assignment[0].resetCount + 1,
    })
    .where(eq(assignments.id, assignmentId))
    .returning();

  return updated[0];
}
