import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getClasses, createClass } from "@/lib/db/queries/classes";
import { logAudit } from "@/lib/db/queries/system";

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.number().int().min(6).max(8),
  curriculum: z.enum(["american", "cambridge"]),
  academicYear: z.string().default("2026-2027"),
});

export async function GET() {
  try {
    const actor = await requireRole(["school_admin", "system_admin", "teacher"]);
    const list = await getClasses(actor);
    return NextResponse.json({ classes: list });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const body = await req.json();
    const parsed = createClassSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const newClass = await createClass(actor, parsed.data);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "create_class",
      entityType: "class",
      entityId: newClass.id,
      meta: { name: newClass.name, grade: newClass.grade },
    });

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
