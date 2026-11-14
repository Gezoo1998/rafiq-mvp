import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { messageFlags, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "@/lib/db/queries/system";

const flagSchema = z.object({
  reason: z.enum(["wrong_answer", "unsafe", "confusing", "other"]),
  note: z.string().max(500).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { id } = await params;
    const messageId = parseInt(id, 10);
    if (isNaN(messageId)) {
      return NextResponse.json({ error: { message: "Invalid message ID" } }, { status: 400 });
    }

    const body = await req.json();
    const parsed = flagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const msg = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!msg[0]) {
      return NextResponse.json({ error: { message: "Message not found" } }, { status: 404 });
    }

    const inserted = await db
      .insert(messageFlags)
      .values({
        messageId,
        flaggedBy: actor.userId,
        reason: parsed.data.reason,
        note: parsed.data.note || null,
      })
      .returning();

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "flag_message",
      entityType: "message",
      entityId: id,
      meta: { reason: parsed.data.reason },
    });

    return NextResponse.json({ flag: inserted[0] }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
