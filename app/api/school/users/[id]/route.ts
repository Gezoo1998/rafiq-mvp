import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getUserById, updateUser } from "@/lib/db/queries/users";
import { logAudit } from "@/lib/db/queries/system";

const patchUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  externalId: z.string().nullable().optional(),
  grade: z.number().int().min(6).max(8).nullable().optional(),
  curriculum: z.enum(["american", "cambridge"]).nullable().optional(),
  preferredLanguage: z.enum(["en", "ar", "mixed"]).nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id } = await params;
    const user = await getUserById(actor, id);
    if (!user) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }
    return NextResponse.json({ user });
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
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = patchUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const updated = await updateUser(actor, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "update_user",
      entityType: "user",
      entityId: id,
    });

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

