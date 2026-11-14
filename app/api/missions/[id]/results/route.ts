import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getMissionResults } from "@/lib/db/queries/missions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { id } = await params;
    const results = await getMissionResults(actor, id);

    if (!results) {
      return NextResponse.json({ error: { message: "Mission not found" } }, { status: 404 });
    }

    return NextResponse.json(results);
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

