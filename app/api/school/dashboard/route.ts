import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getSchoolDashboard } from "@/lib/db/queries/system";

export async function GET() {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const dashboard = await getSchoolDashboard(actor);
    return NextResponse.json({ dashboard });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
