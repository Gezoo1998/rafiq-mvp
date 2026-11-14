import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getStudentAssignment } from "@/lib/db/queries/students";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const actor = await requireRole(["student"]);
    const { assignmentId } = await params;
    const assignment = await getStudentAssignment(actor, assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: { message: "Assignment not found" } }, { status: 404 });
    }
    return NextResponse.json(assignment);
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
