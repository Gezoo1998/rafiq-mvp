"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RafiqMascot } from "@/components/ui/mascot";
import { LogOut, Flame, Star } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-amber-200/60 bg-white/90 backdrop-blur-md shadow-2xs">
      <div className="w-full max-w-[780px] mx-auto px-4 sm:px-6 h-17 flex items-center justify-between">
        <Link href="/missions" className="flex items-center gap-3 group">
          <RafiqMascot size="sm" expression="waving" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-neutral-900 text-xl tracking-tight">Rafiq</span>
              <span className="font-bold text-amber-600 text-base font-sans" dir="rtl">رفيق</span>
            </div>
            <span className="text-[11px] text-amber-600 font-extrabold block -mt-0.5">
              Friendly Study Adventure 🎈
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Gamified Streak & Stars */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black" title="Daily Streak">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>5 Days</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black" title="Star Points">
              <Star className="h-3.5 w-3.5 text-sky-500 fill-sky-500" />
              <span>120</span>
            </div>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/80">
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <span className="text-xs font-bold text-neutral-900 max-w-[110px] truncate">
              {studentName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={loggingOut}
            className="text-neutral-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-2.5 rounded-xl gap-1 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-bold hidden sm:inline">Exit</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
