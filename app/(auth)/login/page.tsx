"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CodeInput } from "@/components/ui/code-input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quickRole, setQuickRole] = React.useState<string | null>(null);

  const handleSubmit = async (submitCode?: string) => {
    const targetCode = typeof submitCode === "string" ? submitCode : code;
    if (!targetCode.trim()) {
      setError("Please enter your access code");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Invalid code. Please check your code and try again.");
        setLoading(false);
        setQuickRole(null);
        return;
      }

      router.push(data.redirectTo || "/missions");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
      setQuickRole(null);
    }
  };

  const handleQuickSelect = (demoCode: string, roleName: string) => {
    setCode(demoCode);
    setQuickRole(roleName);
    handleSubmit(demoCode);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-950 via-navy-900 to-slate-950 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 text-center relative z-10">
        {/* Top Back Link */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-primary-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 mx-auto hover:scale-105 transition-all"
          >
            <MessageSquare className="h-8 w-8" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              Rafiq
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Portal
              </span>
            </h1>
            <p className="text-xl font-bold text-indigo-400 font-sans mt-0.5" dir="rtl">
              رفيق • التعلم الذكي
            </p>
          </div>
          <p className="text-sm text-neutral-300">
            Learn with your personal AI study companion
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl text-start space-y-5">
          <div className="space-y-1 text-center sm:text-start">
            <h2 className="text-lg font-black text-navy-900 dark:text-white">Enter your access code</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Type the personal code from your card or school administrator
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <CodeInput
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError(null);
              }}
              error={error || undefined}
              onEnter={() => handleSubmit()}
              disabled={loading}
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="text-base font-bold shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700"
            >
              <span>{quickRole ? `Logging in as ${quickRole}...` : "Log In"}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>1-Click Test Personas:</span>
              </span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Instant Access
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickSelect("S-ZJD0-1BXZ-40", "Student")}
                disabled={loading}
                className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 hover:border-blue-400 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 hover:shadow-md text-start transition-all disabled:opacity-50 hover:scale-102"
              >
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                  <GraduationCap className="h-4 w-4" />
                  <span>Student</span>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">Omar (Grade 6)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("T-W05C-X6TS-PG", "Teacher")}
                disabled={loading}
                className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 hover:shadow-md text-start transition-all disabled:opacity-50 hover:scale-102"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                  <BookOpen className="h-4 w-4" />
                  <span>Teacher</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">Ms. Huda (Math)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("A-KBXZ-9GS6-F1", "Principal")}
                disabled={loading}
                className="p-3 rounded-2xl border border-purple-200 dark:border-purple-900/60 hover:border-purple-400 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/40 dark:to-pink-950/40 hover:shadow-md text-start transition-all disabled:opacity-50 hover:scale-102"
              >
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                  <Building2 className="h-4 w-4" />
                  <span>Principal</span>
                </div>
                <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 truncate mt-0.5">Dr. Mona (Admin)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("Y-8164-RC0Z-T4", "System Admin")}
                disabled={loading}
                className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 hover:border-amber-400 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/40 hover:shadow-md text-start transition-all disabled:opacity-50 hover:scale-102"
              >
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-extrabold text-xs">
                  <BarChart3 className="h-4 w-4" />
                  <span>System Admin</span>
                </div>
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 truncate mt-0.5">Operations Command</div>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800">
            Lost your code? Ask your school administrator or teacher.
          </div>
        </div>

        {/* Trust & Safe footer note */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Private & safe for K-12 students • Zero email or password required</span>
        </div>
      </div>
    </main>
  );
}
