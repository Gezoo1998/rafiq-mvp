import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getClassById, updateClass, deleteClass, getClassStudents } from "@/lib/db/queries/classes";
import { logAudit } from "@/lib/db/queries/system";

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  grade: z.number().int().min(6).max(8).optional(),
  curriculum: z.enum(["american", "cambridge"]).optional(),
  academicYear: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin", "teacher"]);
    const { id } = await params;
    const cls = await getClassById(actor, id);
    if (!cls) {
      return NextResponse.json({ error: { message: "Class not found" } }, { status: 404 });
    }

    const students = await getClassStudents(actor, id);
    return NextResponse.json({ class: cls, students });
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
    const parsed = updateClassSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const updated = await updateClass(actor, id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: { message: "Class not found" } }, { status: 404 });
    }

    return NextResponse.json({ class: updated });
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
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id } = await params;

    const res = await deleteClass(actor, id);
    if (!res.success) {
      return NextResponse.json({ error: { message: res.error } }, { status: 400 });
    }

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "delete_class",
      entityType: "class",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
