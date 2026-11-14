import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { reopenMission } from "@/lib/db/queries/missions";
import { logAudit } from "@/lib/db/queries/system";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const { id } = await params;
    const reopened = await reopenMission(actor, id);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "reopen_mission",
      entityType: "mission",
      entityId: id,
    });

    return NextResponse.json({ mission: reopened });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
