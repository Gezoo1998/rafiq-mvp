import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { activateUser } from "@/lib/db/queries/users";
import { logAudit } from "@/lib/db/queries/system";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id } = await params;

    const updated = await activateUser(actor, id);
    if (!updated) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "activate_user",
      entityType: "user",
      entityId: id,
    });

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

