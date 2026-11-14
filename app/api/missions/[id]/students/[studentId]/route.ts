import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getMissionStudentDrillDown } from "@/lib/db/queries/missions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { id: missionId, studentId } = await params;

    const drillDown = await getMissionStudentDrillDown(actor, missionId, studentId);
    if (!drillDown) {
      return NextResponse.json({ error: { message: "Drill down data not found" } }, { status: 404 });
    }

    return NextResponse.json(drillDown);
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

