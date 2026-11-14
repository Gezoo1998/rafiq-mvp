import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getStudentMissions } from "@/lib/db/queries/students";

export async function GET() {
  try {
    const actor = await requireRole(["student"]);
    const list = await getStudentMissions(actor);
    return NextResponse.json({ assignments: list });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

