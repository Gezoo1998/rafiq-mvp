import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getMissionById, updateMission, deleteMission } from "@/lib/db/queries/missions";
import { logAudit } from "@/lib/db/queries/system";

const updateSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  instructions: z.string().max(2000).nullable().optional(),
  dueAt: z.string().transform((str) => new Date(str)).optional(),
  languageMode: z.enum(["en", "ar", "mixed"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { id } = await params;
    const mission = await getMissionById(actor, id);
    if (!mission) {
      return NextResponse.json({ error: { message: "Mission not found" } }, { status: 404 });
    }
    return NextResponse.json({ mission });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const updated = await updateMission(actor, id, parsed.data);
    return NextResponse.json({ mission: updated });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const { id } = await params;
    await deleteMission(actor, id);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "delete_mission",
      entityType: "mission",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
