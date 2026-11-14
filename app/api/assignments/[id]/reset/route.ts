import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { resetAssignment } from "@/lib/db/queries/students";
import { logAudit } from "@/lib/db/queries/system";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const { id: assignmentId } = await params;

    const updated = await resetAssignment(actor, assignmentId);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "reset_assignment",
      entityType: "assignment",
      entityId: assignmentId,
    });

    return NextResponse.json({ assignment: updated });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

