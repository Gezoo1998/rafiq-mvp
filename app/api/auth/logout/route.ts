import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/db/queries/system";

export async function POST() {
  const session = await getSession();
  if (session) {
    await logAudit({
      schoolId: session.schoolId,
      actorId: session.sub,
      action: "logout",
      entityType: "user",
      entityId: session.sub,
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
