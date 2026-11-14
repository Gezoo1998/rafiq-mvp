import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { sessions, missions, assignments, messages, evaluations, aiUsage } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { runEvaluation, levelToLabel } from "@/lib/ai/evaluate";
import { logAudit } from "@/lib/db/queries/system";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["student"]);
    const { id: sessionId } = await params;

    const sessionRes = await db
      .select({
        session: sessions,
        mission: missions,
        assignment: assignments,
      })
      .from(sessions)
      .innerJoin(missions, eq(sessions.missionId, missions.id))
      .innerJoin(assignments, eq(sessions.assignmentId, assignments.id))
      .where(and(eq(sessions.id, sessionId), eq(sessions.studentId, actor.userId)))
      .limit(1);

    if (!sessionRes[0]) {
      return NextResponse.json({ error: { message: "Session not found" } }, { status: 404 });
    }

    const { session, mission, assignment } = sessionRes[0];

    // Mark session as finished
    await db
      .update(sessions)
      .set({
        status: "finished",
        finishedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));

    // Fetch conversation transcript
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.id));

    const transcript = allMessages
      .map((m) => `${m.role === "user" ? "Student" : "Rafiq"}: ${m.content}`)
      .join("\n\n");

    const userMessageCount = allMessages.filter((m) => m.role === "user").length;

    try {
      const { evaluation, raw, usage } = await runEvaluation({
        missionTitle: mission.title,
        missionInstructions: mission.instructions,
        subject: mission.subject,
        grade: mission.grade,
        curriculum: mission.curriculum,
        transcript,
        messageCount: userMessageCount,
      });

      // Save evaluation row
      const savedEval = await db
        .insert(evaluations)
        .values({
          sessionId,
          assignmentId: assignment.id,
          status: "ok",
          masteryScore: evaluation.mastery_score,
          level: evaluation.level,
          strengths: evaluation.strengths,
          gaps: evaluation.gaps,
          hintsUsed: evaluation.hints_used,
          practiceCorrect: evaluation.practice_correct,
          practiceTotal: evaluation.practice_total,
          studentSummary: evaluation.student_summary,
          teacherSummary: evaluation.teacher_summary,
          nextStep: evaluation.next_step,
          safetyConcern: evaluation.safety_concern,
          raw,
          model: usage.model,
        })
        .returning();

      // Mark assignment as completed
      await db
        .update(assignments)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(assignments.id, assignment.id));

      // Record AI usage
      if (usage.tokensIn > 0) {
        await db.insert(aiUsage).values({
          schoolId: session.schoolId,
          userId: actor.userId,
          sessionId,
          kind: "evaluation",
          provider: process.env.AI_PROVIDER || "mock",
          model: usage.model,
          tokensIn: usage.tokensIn,
          tokensOut: usage.tokensOut,
          latencyMs: usage.latencyMs,
          status: "ok",
        });
      }

      await logAudit({
        schoolId: session.schoolId,
        actorId: actor.userId,
        action: "session_evaluated",
        entityType: "session",
        entityId: sessionId,
        meta: { score: evaluation.mastery_score, level: evaluation.level },
      });

      // Student-facing summary (Section 5.4: label, strengths, next_step, meter)
      return NextResponse.json({
        evaluation: {
          level: evaluation.level,
          levelLabel: levelToLabel(evaluation.level),
          strengths: evaluation.strengths.slice(0, 2),
          nextStep: evaluation.next_step,
          studentSummary: evaluation.student_summary,
          masteryScore: evaluation.mastery_score,
        },
      });
    } catch (evalError: any) {
      console.error("Evaluation error:", evalError);

      // Mark assignment as evaluation_failed so student/teacher sees retry option
      await db
        .update(assignments)
        .set({ status: "evaluation_failed" })
        .where(eq(assignments.id, assignment.id));

      return NextResponse.json(
        {
          error: {
            code: "EVALUATION_FAILED",
            message: "Evaluation encountered a delay. You can tap 'Retry Evaluation' to submit your results.",
          },
        },
        { status: 502 }
      );
    }
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

