import * as React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { schools } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StaffShell } from "@/components/domain/StaffShell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "student") {
    redirect("/missions");
  }

  let schoolName: string | null = null;
  if (session.schoolId) {
    const schoolRes = await db
      .select({ name: schools.name })
      .from(schools)
      .where(eq(schools.id, session.schoolId))
      .limit(1);
    schoolName = schoolRes[0]?.name || null;
  }

  const isMockAi = process.env.AI_PROVIDER === "mock" || !process.env.AI_API_KEY;

  return (
    <StaffShell
      user={{
        id: session.sub,
        fullName: session.name,
        role: session.role as "teacher" | "school_admin" | "system_admin",
        schoolId: session.schoolId,
        schoolName,
      }}
      isMockAi={isMockAi}
    >
      {children}
    </StaffShell>
  );
}

