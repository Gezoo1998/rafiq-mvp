"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CodeInput } from "@/components/ui/code-input";
import { Button } from "@/components/ui/button";
import { triggerCelebrationConfetti } from "@/components/ui/motion";
import { RafiqMascot } from "@/components/ui/mascot";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  Star,
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
      setError("Please type your access code");
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
        setError(data.error?.message || "That code doesn't look right. Check your card and try again!");
        setLoading(false);
        setQuickRole(null);
        return;
      }

      triggerCelebrationConfetti();
      setTimeout(() => {
        router.push(data.redirectTo || "/missions");
        router.refresh();
      }, 350);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FFFDF7] relative overflow-hidden">
      {/* Floating Ambient Decors */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 text-center relative z-10">
        {/* Top Back Link */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 hover:text-amber-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Homepage</span>
          </Link>
        </div>

        {/* Mascot Greeting */}
        <div className="flex flex-col items-center space-y-2">
          <RafiqMascot size="lg" expression="waving" />
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
            Welcome to Rafiq! 🌟
          </h1>
          <p className="text-sm font-bold text-amber-700 font-sans" dir="rtl">
            أهلاً بك يا بطل! جاهز للمغامرة والتعلم؟
          </p>
        </div>

        {/* Main Card with Chunky 3D Border */}
        <div className="rounded-3xl border-4 border-amber-300 bg-white p-6 sm:p-8 shadow-xl space-y-5 text-start">
          <div>
            <h2 className="text-base font-black text-neutral-900">
              Enter Your Card Code 🔑
            </h2>
            <p className="text-xs font-bold text-neutral-500 mt-0.5">
              Type the code from your card or school administrator.
            </p>
          </div>

          <div className="space-y-4">
            <CodeInput
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError(null);
              }}
              error={error || undefined}
              disabled={loading}
              onEnter={() => handleSubmit()}
            />

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !code.trim()}
              className="w-full py-3.5 px-4 rounded-2xl text-sm font-black text-neutral-950 bg-amber-400 hover:bg-amber-300 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && !quickRole ? (
                <>
                  <div className="h-4 w-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Entering Quest...</span>
                </>
              ) : (
                <>
                  <span>Start Learning Quest 🚀</span>
                </>
              )}
            </button>
          </div>

          {/* 1-Click Test Access Pills */}
          <div className="pt-4 border-t-2 border-amber-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-neutral-500">
              <span>Or click a demo character:</span>
              <span className="text-[10px] text-amber-600 font-black">1-Click Login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect("S-ZJD0-1BXZ-40", "student")}
                disabled={loading}
                className="p-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <GraduationCap className="h-4 w-4 text-amber-600" />
                  <span>Omar (Student)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  S-ZJD0-1BXZ-40
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("T-W05C-X6TS-PG", "teacher")}
                disabled={loading}
                className="p-2.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Ms. Huda (Teacher)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  T-W05C-X6TS-PG
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("A-KBXZ-9GS6-F1", "school_admin")}
                disabled={loading}
                className="p-2.5 rounded-2xl border-2 border-sky-300 bg-sky-50 hover:bg-sky-100 text-left transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-sky-900">
                  <Building2 className="h-4 w-4 text-sky-600" />
                  <span>Dr. Mona (Principal)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  A-KBXZ-9GS6-F1
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("Y-8164-RC0Z-T4", "system_admin")}
                disabled={loading}
                className="p-2.5 rounded-2xl border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-left transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-900">
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span>System Ops</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500">
                  Y-8164-RC0Z-T4
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="text-xs font-bold text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Zero passwords needed • 100% Student Data Privacy</span>
        </p>
      </div>
    </main>
  );
}
