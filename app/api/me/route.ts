import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users, schools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const userRows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      role: users.role,
      schoolId: users.schoolId,
      grade: users.grade,
      curriculum: users.curriculum,
      preferredLanguage: users.preferredLanguage,
      codeLast4: users.codeLast4,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);

  if (!userRows[0] || userRows[0].status !== "active") {
    return NextResponse.json({ user: null });
  }

  let schoolData = null;
  if (userRows[0].schoolId) {
    const schoolRows = await db
      .select({
        id: schools.id,
        name: schools.name,
        city: schools.city,
        defaultLanguageMode: schools.defaultLanguageMode,
        isActive: schools.isActive,
      })
      .from(schools)
      .where(eq(schools.id, userRows[0].schoolId))
      .limit(1);

    schoolData = schoolRows[0] || null;
  }

  return NextResponse.json({
    user: {
      ...userRows[0],
      school: schoolData,
    },
  });
}

