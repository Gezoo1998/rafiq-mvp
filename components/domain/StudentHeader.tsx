"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Flame, Star, Sparkles } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="w-full max-w-[860px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        <Link href="/missions" className="flex items-center gap-3 group">
          <img
            src="/images/new-design/rafiq-logo.png"
            alt="Rafiq رفيق"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-[#0F172A] text-xl tracking-tight leading-none">
                رفيق
              </span>
              <span className="font-black text-[#1D4ED8] text-lg tracking-tight leading-none">
                Rafiq
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
              مغامرة التعلم الذكي 🎈
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Gamified Streak & Stars */}
          <div className="hidden sm:flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-900 text-xs font-black"
              title="Daily Streak"
            >
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>5 أيام</span>
            </div>
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-900 text-xs font-black"
              title="Star Points"
            >
              <Star className="h-3.5 w-3.5 text-blue-600 fill-blue-600" />
              <span>120 نجمة</span>
            </div>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <div className="h-6 w-6 rounded-full bg-[#1D4ED8] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <span className="text-xs font-black text-slate-800 max-w-[110px] truncate">
              {studentName}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            isLoading={loggingOut}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-9 px-2.5 rounded-full gap-1 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-bold hidden sm:inline">خروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
