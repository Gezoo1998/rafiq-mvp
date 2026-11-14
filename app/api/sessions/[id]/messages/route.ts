import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { sessions, missions, messages, aiUsage, schools } from "@/lib/db/schema";
import { eq, and, desc, asc, gte, sql } from "drizzle-orm";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { getAIProvider, ChatMessage } from "@/lib/ai";

const messageBodySchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message must be 1,000 characters or less"),
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["student"]);
    const { id: sessionId } = await params;

    const body = await req.json();
    const parsed = messageBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid message length or format" } }, { status: 400 });
    }

    // 1. Authorize: session owned by student, active, mission not closed
    const sessionRes = await db
      .select({
        session: sessions,
        mission: missions,
      })
      .from(sessions)
      .innerJoin(missions, eq(sessions.missionId, missions.id))
      .where(and(eq(sessions.id, sessionId), eq(sessions.studentId, actor.userId)))
      .limit(1);

    if (!sessionRes[0]) {
      return NextResponse.json({ error: { message: "Session not found" } }, { status: 404 });
    }

    const { session, mission } = sessionRes[0];

    if (session.status !== "active") {
      return NextResponse.json({ error: { message: "Session is no longer active" } }, { status: 400 });
    }

    if (mission.status === "closed") {
      return NextResponse.json({ error: { message: "This mission is closed" } }, { status: 400 });
    }

    // 2. Caps & Rate limits:
    // a) Max 60 student messages
    const studentMsgCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(eq(messages.sessionId, sessionId), eq(messages.role, "user")));

    if ((studentMsgCount[0]?.count ?? 0) >= 60) {
      return NextResponse.json(
        {
          error: {
            code: "MESSAGE_LIMIT_REACHED",
            message: "You have reached the maximum 60 messages for this session. Please tap Finish to see your summary!",
          },
        },
        { status: 400 }
      );
    }

    // b) Rate limit: 1 message per 2 seconds
    const lastUserMsg = await db
      .select({ createdAt: messages.createdAt })
      .from(messages)
      .where(and(eq(messages.sessionId, sessionId), eq(messages.role, "user")))
      .orderBy(desc(messages.createdAt))
      .limit(1);

    if (lastUserMsg[0]) {
      const elapsedMs = Date.now() - new Date(lastUserMsg[0].createdAt).getTime();
      if (elapsedMs < 2000) {
        return NextResponse.json(
          {
            error: {
              code: "RATE_LIMITED",
              message: "Please wait a moment before sending another message.",
            },
          },
          { status: 429 }
        );
      }
    }

    // c) School daily token cap
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const tokensUsedTodayRes = await db
      .select({
        tokens: sql<number>`coalesce(sum(${aiUsage.tokensIn} + ${aiUsage.tokensOut}), 0)::int`,
      })
      .from(aiUsage)
      .where(and(eq(aiUsage.schoolId, session.schoolId), gte(aiUsage.createdAt, startOfToday)));

    const tokensToday = tokensUsedTodayRes[0]?.tokens ?? 0;
    const schoolRow = await db.select().from(schools).where(eq(schools.id, session.schoolId)).limit(1);
    const tokenCap = schoolRow[0]?.aiDailyTokenCap ?? 2000000;

    if (tokensToday >= tokenCap) {
      return NextResponse.json(
        {
          error: {
            code: "DAILY_CAP_EXCEEDED",
            message: "Rafiq is resting for today. Try again tomorrow, or ask your teacher.",
          },
        },
        { status: 429 }
      );
    }

    // 3. Insert the user message
    await db.insert(messages).values({
      sessionId,
      role: "user",
      content: parsed.data.content,
      tokensIn: Math.ceil(parsed.data.content.length / 4),
      tokensOut: 0,
    });

    // 4. Build prompt: system prompt + last 24 messages
    const recentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(asc(messages.id))
      .limit(24);

    const systemPrompt = buildSystemPrompt({
      studentName: actor.name,
      grade: mission.grade,
      curriculum: mission.curriculum,
      subject: mission.subject,
      missionTitle: mission.title,
      missionInstructions: mission.instructions,
      languageMode: session.languageMode,
    });

    const chatHistory: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // 5. Setup SSE Stream
    const provider = getAIProvider();
    const encoder = new TextEncoder();
    const startTime = Date.now();

    const stream = new ReadableStream({
      async start(controller) {
        let fullAssistantReply = "";
        let hasSafetyFlag = false;
        let isSessionComplete = false;

        try {
          for await (const chunk of provider.streamChat({ messages: chatHistory })) {
            fullAssistantReply += chunk;

            // Stream delta to client, but buffer markers
            controller.enqueue(
              encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
            );
          }

          // Check markers
          if (fullAssistantReply.includes("[[SAFETY_FLAG]]")) {
            hasSafetyFlag = true;
            await db
              .update(sessions)
              .set({ safetyFlag: true })
              .where(eq(sessions.id, sessionId));
          }

          if (fullAssistantReply.includes("[[SESSION_COMPLETE]]")) {
            isSessionComplete = true;
          }

          // Clean markers from saved text
          const cleanedContent = fullAssistantReply
            .replace(/\[\[SESSION_COMPLETE\]\]/g, "")
            .replace(/\[\[SAFETY_FLAG\]\]/g, "")
            .trim();

          const tokensIn = Math.ceil(systemPrompt.length / 4) + 150;
          const tokensOut = Math.ceil(cleanedContent.length / 4);

          // Insert assistant message
          const savedMessage = await db
            .insert(messages)
            .values({
              sessionId,
              role: "assistant",
              content: cleanedContent,
              tokensIn,
              tokensOut,
              model: process.env.AI_MODEL_TUTOR || "tutor-model",
            })
            .returning();

          // Increment message count on session
          await db
            .update(sessions)
            .set({
              messageCount: sql`${sessions.messageCount} + 2`,
            })
            .where(eq(sessions.id, sessionId));

          // Log AI usage
          await db.insert(aiUsage).values({
            schoolId: session.schoolId,
            userId: actor.userId,
            sessionId,
            kind: "tutor",
            provider: process.env.AI_PROVIDER || "mock",
            model: process.env.AI_MODEL_TUTOR || "tutor-model",
            tokensIn,
            tokensOut,
            latencyMs: Date.now() - startTime,
            status: "ok",
          });

          // Send done event
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                messageId: savedMessage[0].id,
                sessionComplete: isSessionComplete,
              })}\n\n`
            )
          );
        } catch (err: any) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                code: "AI_ERROR",
                message: "Rafiq had a hiccup. Please try sending your answer again.",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

