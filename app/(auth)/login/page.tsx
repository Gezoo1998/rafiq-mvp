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
        setError(data.error?.message || "Invalid code. Please try again.");
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-neutral-50 via-primary-50/20 to-neutral-100">
      <div className="w-full max-w-md mx-auto space-y-6 text-center">
        {/* Top Back Link */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md mx-auto hover:scale-105 transition-transform">
            <MessageSquare className="h-7 w-7" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-900">
              Rafiq
            </h1>
            <p className="text-xl font-bold text-primary-600 font-sans" dir="rtl">
              رفيق
            </p>
          </div>
          <p className="text-sm text-neutral-600">
            Learn with your personal AI study companion
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-xl text-start space-y-5">
          <div className="space-y-1 text-center sm:text-start">
            <h2 className="text-lg font-bold text-navy-900">Enter your code</h2>
            <p className="text-xs text-neutral-600">
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
              className="text-base font-semibold shadow-sm"
            >
              <span>{quickRole ? `Logging in as ${quickRole}...` : "Continue"}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-3 border-t border-neutral-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary-500" />
                <span>1-Click Test Personas:</span>
              </span>
              <span className="text-[11px] text-neutral-500">Instant Demo</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect("S-ZJD0-1BXZ-40", "Student")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-blue-200 hover:border-blue-400 bg-blue-50/70 hover:bg-blue-100/70 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Student</span>
                </div>
                <div className="text-[11px] text-blue-600/80 truncate">Omar (6A Math)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("T-W05C-X6TS-PG", "Teacher")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/70 hover:bg-emerald-100/70 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Teacher</span>
                </div>
                <div className="text-[11px] text-emerald-600/80 truncate">Ms. Huda (Math)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("A-KBXZ-9GS6-F1", "Principal")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-purple-200 hover:border-purple-400 bg-purple-50/70 hover:bg-purple-100/70 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>School Admin</span>
                </div>
                <div className="text-[11px] text-purple-600/80 truncate">Dr. Mona (Principal)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("Y-8164-RC0Z-T4", "System Admin")}
                disabled={loading}
                className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-400 bg-amber-50/70 hover:bg-amber-100/70 text-start transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>System Admin</span>
                </div>
                <div className="text-[11px] text-amber-600/80 truncate">Operations</div>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
            Lost your code? Ask your school administrator or teacher.
          </div>
        </div>

        {/* Trust & Safe footer note */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
          <ShieldCheck className="h-4 w-4 text-primary-600" />
          <span>Private & safe for school students • No email required</span>
        </div>
      </div>
    </main>
  );
}
