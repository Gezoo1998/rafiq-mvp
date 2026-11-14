import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { startOrResumeSession } from "@/lib/db/queries/students";
import { db } from "@/lib/db/client";
import { messages } from "@/lib/db/schema";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { getAIProvider } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const actor = await requireRole(["student"]);
    const { assignmentId } = await params;

    const sessionData = await startOrResumeSession(actor, assignmentId);

    // If session is newly created and has 0 messages, generate the initial greeting
    if (sessionData.messages.length === 0) {
      const prompt = buildSystemPrompt({
        studentName: actor.name,
        grade: sessionData.mission.grade,
        curriculum: sessionData.mission.curriculum,
        subject: sessionData.mission.subject,
        missionTitle: sessionData.mission.title,
        missionInstructions: sessionData.mission.instructions,
        languageMode: sessionData.session.languageMode,
      });

      const provider = getAIProvider();
      let initialGreeting = "";

      for await (const chunk of provider.streamChat({
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Hello! I am ready to begin this mission." },
        ],
        maxTokens: 250,
      })) {
        initialGreeting += chunk;
      }

      // Clean [[SESSION_COMPLETE]] or other tags if any
      const cleanGreeting = initialGreeting.replace(/\[\[SESSION_COMPLETE\]\]/g, "").trim();

      const inserted = await db
        .insert(messages)
        .values({
          sessionId: sessionData.sessionId,
          role: "assistant",
          content: cleanGreeting || "Hi! Welcome to your mission. Let's learn step by step together!",
          tokensIn: 100,
          tokensOut: 60,
          model: "tutor",
        })
        .returning();

      sessionData.messages.push(inserted[0]);
    }

    return NextResponse.json({
      sessionId: sessionData.sessionId,
      session: sessionData.session,
      mission: sessionData.mission,
      messages: sessionData.messages,
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
