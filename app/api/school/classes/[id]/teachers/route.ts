import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { setClassTeachers } from "@/lib/db/queries/classes";

const setTeachersSchema = z.array(
  z.object({
    teacherId: z.string().uuid(),
    subject: z.enum(["math", "science", "english"]),
  })
);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { id: classId } = await params;
    const body = await req.json();

    const parsed = setTeachersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    await setClassTeachers(actor, classId, parsed.data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

