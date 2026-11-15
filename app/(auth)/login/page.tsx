"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CodeInput } from "@/components/ui/code-input";
import { triggerCelebrationConfetti } from "@/components/ui/motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  Star,
  Lock,
  Sparkles,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = React.useState<"ar" | "en">("ar");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [quickRole, setQuickRole] = React.useState<string | null>(null);

  const isAr = lang === "ar";

  const handleSubmit = async (submitCode?: string) => {
    const targetCode = typeof submitCode === "string" ? submitCode : code;
    if (!targetCode.trim()) {
      setError(isAr ? "يرجى كتابة رمز الدخول الخاص بك" : "Please type your access code");
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
        setError(
          data.error?.message ||
            (isAr
              ? "الرمز المدخل غير صحيح. تأكد من بطاقتك وحاول مرة أخرى!"
              : "That code doesn't look right. Check your card and try again!")
        );
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
      setError(
        isAr
          ? "خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت."
          : "Network error. Please check your connection and try again."
      );
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
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white text-[#0F172A] relative overflow-hidden font-sans"
    >
      {/* Background Soft Glow Accents */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-violet-200/35 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-6 text-center relative z-10">
        {/* Top Header Row: Back Link & Language Switcher */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-full shadow-2xs border border-slate-200/80 transition-all hover:scale-105 active:scale-95"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>{isAr ? "العودة للرئيسية" : "Back to Home"}</span>
          </Link>

          <button
            onClick={() => setLang(isAr ? "en" : "ar")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-black text-slate-700 border border-slate-200/80 shadow-2xs transition-all hover:scale-105 active:scale-95"
          >
            <Globe className="h-3.5 w-3.5 text-[#1D4ED8]" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
        </div>

        {/* Logo & Welcoming Heading */}
        <div className="flex flex-col items-center space-y-2">
          <img
            src="/images/new-design/rafiq-logo.png"
            alt="Rafiq رفيق"
            className="h-12 w-auto object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {isAr ? "مرحباً بك في رفيق! 🌟" : "Welcome to Rafiq! 🌟"}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            {isAr
              ? "الرفيق التعليمي الذكي • جاهز لتحديات اليوم؟"
              : "Your Smart Socratic Learning Companion"}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-blue-600/5 space-y-5 text-start">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {isAr ? "أدخل رمز البطاقة المدرسية 🔑" : "Enter Your Card Code 🔑"}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {isAr
                ? "اكتب الرمز المطبوع على بطاقتك أو المقدم من إدارة المدرسة."
                : "Type the code from your card or school administrator."}
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
              className="w-full py-3.5 px-4 rounded-full text-sm font-black text-white bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && !quickRole ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isAr ? "جارٍ التحقق والدخول..." : "Entering Quest..."}</span>
                </>
              ) : (
                <>
                  <span>{isAr ? "دخول فوري للمنصة 🚀" : "Start Learning Quest 🚀"}</span>
                </>
              )}
            </button>
          </div>

          {/* 1-Click Test Access Pills */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-500">
              <span>{isAr ? "أو جرّب أحد الحسابات التجريبية:" : "Or 1-click demo login:"}</span>
              <span className="text-[10px] text-[#1D4ED8] font-black">
                {isAr ? "دخول تجريبي" : "Demo Ready"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelect("S-ZJD0-1BXZ-40", "student")}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-start transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <GraduationCap className="h-4 w-4 text-[#1D4ED8]" />
                  <span>{isAr ? "عمر (طالب)" : "Omar (Student)"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  S-ZJD0-1BXZ-40
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("T-W05C-X6TS-PG", "teacher")}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-start transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>{isAr ? "أ. هدى (معلمة)" : "Ms. Huda (Teacher)"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  T-W05C-X6TS-PG
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("A-KBXZ-9GS6-F1", "school_admin")}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-start transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  <span>{isAr ? "د. منى (مديرة)" : "Dr. Mona (Principal)"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  A-KBXZ-9GS6-F1
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect("Y-8164-RC0Z-T4", "system_admin")}
                disabled={loading}
                className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 text-start transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <BarChart3 className="h-4 w-4 text-slate-700" />
                  <span>{isAr ? "إدارة المنصة" : "System Ops"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Y-8164-RC0Z-T4
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            {isAr
              ? "دون الحاجة لكلمات مرور • حماية خصوصية بنسبة 100%"
              : "Zero passwords needed • 100% Student Data Privacy"}
          </span>
        </p>
      </div>
    </main>
  );
}
