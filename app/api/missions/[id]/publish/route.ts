import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { publishMission } from "@/lib/db/queries/missions";
import { logAudit } from "@/lib/db/queries/system";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const { id } = await params;
    const published = await publishMission(actor, id);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "publish_mission",
      entityType: "mission",
      entityId: id,
      meta: { title: published.title },
    });

    return NextResponse.json({ mission: published });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
