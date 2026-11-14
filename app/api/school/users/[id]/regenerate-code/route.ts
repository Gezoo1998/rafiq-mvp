import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getUserById, regenerateUserCode } from "@/lib/db/queries/users";
import { generateAccessCode } from "@/lib/auth/codes";
import { logAudit } from "@/lib/db/queries/system";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id } = await params;

    const targetUser = await getUserById(actor, id);
    if (!targetUser) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }

    const codeData = generateAccessCode(targetUser.role as any);

    const updated = await regenerateUserCode(
      actor,
      id,
      codeData.codeHmac,
      codeData.codeLast4
    );

    if (!updated) {
      return NextResponse.json({ error: { message: "Failed to regenerate code" } }, { status: 404 });
    }

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "regenerate_code",
      entityType: "user",
      entityId: id,
      meta: { last4: codeData.codeLast4 },
    });

    return NextResponse.json({
      user: updated,
      code: codeData.plainCode,
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

