"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, LogOut, Sparkles } from "lucide-react";

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

  const initials = studentName
    ? studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md shadow-xs">
      <div className="w-full max-w-[760px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/missions" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-md shadow-primary-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-navy-900 text-xl tracking-tight">Rafiq</span>
              <span className="font-bold text-primary-600 text-base font-arabic" dir="rtl">رفيق</span>
            </div>
            <span className="text-2xs text-neutral-400 block -mt-1 font-medium">Socratic Study Companion</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/80 border border-neutral-200/60">
            <div className="h-6 w-6 rounded-full bg-primary-600 text-white font-bold text-2xs flex items-center justify-center">
              {initials}
            </div>
            <span className="text-xs font-bold text-navy-900 max-w-[120px] truncate">
              {studentName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={loggingOut}
            className="text-neutral-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-3 rounded-xl gap-1.5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-semibold hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
