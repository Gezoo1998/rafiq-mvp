import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getSchoolById, updateSchool } from "@/lib/db/queries/schools";
import { logAudit } from "@/lib/db/queries/system";

const updateSchoolSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  defaultLanguageMode: z.enum(["en", "ar", "mixed"]).optional(),
  aiDailyTokenCap: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["system_admin"]);
    const { id } = await params;
    const school = await getSchoolById(actor, id);
    if (!school) {
      return NextResponse.json({ error: { message: "School not found" } }, { status: 404 });
    }
    return NextResponse.json({ school });
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
    const actor = await requireRole(["system_admin"]);
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchoolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const updated = await updateSchool(actor, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: { message: "School not found" } }, { status: 404 });
    }

    await logAudit({
      schoolId: id,
      actorId: actor.userId,
      action: "update_school",
      entityType: "school",
      entityId: id,
      meta: parsed.data,
    });

    return NextResponse.json({ school: updated });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
