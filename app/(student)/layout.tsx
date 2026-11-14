import * as React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { StudentHeader } from "@/components/domain/StudentHeader";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    // If a staff member navigates here, let them or redirect appropriately
    if (session.role === "teacher") redirect("/teacher");
    if (session.role === "school_admin") redirect("/school");
    if (session.role === "system_admin") redirect("/system");
  }

  const firstName = session.name ? session.name.split(" ")[0] : "Student";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <StudentHeader studentName={firstName} />
      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 sm:px-6 py-6 pb-20">
        {children}
      </main>
    </div>
  );
}

