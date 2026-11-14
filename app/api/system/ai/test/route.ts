import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getAIProvider } from "@/lib/ai";
import { logAudit } from "@/lib/db/queries/system";

export async function POST() {
  try {
    const actor = await requireRole(["system_admin"]);
    const provider = getAIProvider();
    const startTime = Date.now();

    let fullReply = "";
    for await (const chunk of provider.streamChat({
      messages: [
        { role: "system", content: "You are a test ping responder. Reply with 'PONG' and nothing else." },
        { role: "user", content: "Ping" },
      ],
      maxTokens: 10,
    })) {
      fullReply += chunk;
    }

    const latencyMs = Date.now() - startTime;
    const providerName = process.env.AI_PROVIDER || "mock";
    const model = process.env.AI_MODEL_TUTOR || "llama-3.3-70b-versatile";

    await logAudit({
      actorId: actor.userId,
      action: "ai_connection_test",
      entityType: "system",
      meta: { latencyMs, provider: providerName, model },
    });

    return NextResponse.json({
      success: true,
      provider: providerName,
      model,
      latencyMs,
      response: fullReply.trim(),
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json(
      {
        success: false,
        error: { message: err.message || "Failed to reach AI provider" },
      },
      { status: 500 }
    );
  }
}
