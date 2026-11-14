import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { getSystemUsage } from "@/lib/db/queries/system";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole(["system_admin"]);
    const { searchParams } = new URL(req.url);

    const schoolId = searchParams.get("schoolId") || undefined;
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    const from = fromStr ? new Date(fromStr) : undefined;
    const to = toStr ? new Date(toStr) : undefined;

    const usage = await getSystemUsage(actor, { schoolId, from, to });
    return NextResponse.json({ usage });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
