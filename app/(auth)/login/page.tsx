"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CodeInput } from "@/components/ui/code-input";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your access code");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Invalid code. Please try again.");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/missions");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-neutral-50 to-primary-50/40">
      <div className="w-full max-w-md mx-auto space-y-6 text-center">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 text-white shadow-md mx-auto">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-900">
              Rafiq
            </h1>
            <p className="text-xl font-medium text-primary-600 font-sans" dir="rtl">
              رفيق
            </p>
          </div>
          <p className="text-sm sm:text-base text-neutral-600">
            Learn with your personal AI study companion
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-md text-start space-y-5">
          <div className="space-y-1 text-center sm:text-start">
            <h2 className="text-lg font-bold text-navy-900">Enter your code</h2>
            <p className="text-xs text-neutral-600">
              Type the personal code from your card or school administrator
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <CodeInput
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError(null);
              }}
              error={error || undefined}
              onEnter={handleSubmit}
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
              <span>Continue</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-neutral-600 border-t border-neutral-100">
            Lost your code? Ask your school administrator or teacher.
          </div>
        </div>

        {/* Trust & Safe footer note */}
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
          <ShieldCheck className="h-4 w-4 text-primary-600" />
          <span>Private & safe for school students</span>
        </div>
      </div>
    </main>
  );
}
