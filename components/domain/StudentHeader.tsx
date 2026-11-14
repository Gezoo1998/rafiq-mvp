"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogOut } from "lucide-react";

export function StudentHeader({ studentName }: { studentName: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-surface/95 backdrop-blur-xs">
      <div className="w-full max-w-[720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/missions" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary-600 text-white shadow-xs">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-navy-900 text-lg tracking-tight">Rafiq</span>
              <span className="font-semibold text-primary-600 text-sm" dir="rtl">رفيق</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-900 hidden sm:inline">
            Hi, {studentName} 👋
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={loggingOut}
            className="text-neutral-600 hover:text-neutral-900 gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
