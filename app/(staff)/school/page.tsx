"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SafetyBadge } from "@/components/ui/level-chip";
import {
  Users,
  GraduationCap,
  Layers,
  Coins,
  Upload,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Building2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  KeyRound,
} from "lucide-react";

export default function SchoolDashboardPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/school/dashboard");
        const json = await res.json();
        if (res.ok) setData(json.dashboard);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-neutral-200/70 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-32 bg-neutral-200/60 rounded-2xl" />
          <div className="h-32 bg-neutral-200/60 rounded-2xl" />
          <div className="h-32 bg-neutral-200/60 rounded-2xl" />
          <div className="h-32 bg-neutral-200/60 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-neutral-200/50 rounded-2xl" />
          <div className="h-48 bg-neutral-200/50 rounded-2xl" />
          <div className="h-48 bg-neutral-200/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    studentCount = 0,
    teacherCount = 0,
    activeUsers7d = 0,
    tokensUsedToday = 0,
    dailyTokenCap = 2000000,
    safetyAlerts = [],
  } = data || {};

  const tokenUsagePercent = Math.min(100, Math.round((tokensUsedToday / dailyTokenCap) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-indigo-950 to-primary-900 px-6 sm:px-8 py-8 text-white shadow-xl">
        {/* Glow ornaments */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary-300" />
                School Administrator
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Socratic Guardrails Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              School Administrative Console
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              Monitor student enrollment, teacher staff assignments, AI token usage quotas, and pedagogic safety across all grades.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button asChild variant="primary" size="md" className="gap-2 rounded-xl text-xs font-bold bg-white text-navy-900 hover:bg-white/90 shadow-md">
              <Link href="/school/import">
                <Upload className="h-4 w-4 text-primary-600" />
                <span>Import Roster</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Alerts Banner (US-SCH-01) */}
      {safetyAlerts.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-950 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-rose-950">Pedagogical Safety Concern Triggered</h3>
              <Badge variant="danger" className="text-2xs font-bold">
                {safetyAlerts.length} Flagged Session{safetyAlerts.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              One or more student sessions triggered a distress, frustration, or safety keyword during Socratic tutoring. Please review student transcripts in the Teacher dashboard and coordinate with counseling if appropriate.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Enrolled Students
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              {studentCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Across Grades 6, 7 & 8
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Active Teachers
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              {teacherCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Math, Science & English Faculty
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 to-blue-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Active Users (7 Days)
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">
              {activeUsers7d}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Logged in & active students & staff
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                AI Tokens Today
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-navy-900 mt-1">
              {(tokensUsedToday / 1000).toFixed(1)}k
              <span className="text-xs font-normal text-neutral-500 ml-1">
                / {(dailyTokenCap / 1000).toLocaleString()}k
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 space-y-1.5">
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  tokenUsagePercent > 80
                    ? "bg-rose-500"
                    : tokenUsagePercent > 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${tokenUsagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-2xs text-neutral-500">
              <span>{tokenUsagePercent}% of daily allowance</span>
              <span className="font-semibold text-emerald-600">Quota Normal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/school/users" className="group">
          <Card className="h-full rounded-3xl border border-neutral-200/80 hover:border-indigo-400 transition-all duration-200 hover:shadow-lg bg-white overflow-hidden flex flex-col justify-between">
            <div className="h-1.5 w-full bg-indigo-500" />
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <KeyRound className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-lg font-extrabold text-navy-900 mt-4 tracking-tight">
                People & Access Codes
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Manage student & faculty roster, search user profiles, and securely generate or reset single-use login codes.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-5 pt-0">
              <span className="text-2xs font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                Manage Directory →
              </span>
            </div>
          </Card>
        </Link>

        <Link href="/school/classes" className="group">
          <Card className="h-full rounded-3xl border border-neutral-200/80 hover:border-emerald-400 transition-all duration-200 hover:shadow-lg bg-white overflow-hidden flex flex-col justify-between">
            <div className="h-1.5 w-full bg-emerald-500" />
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-lg font-extrabold text-navy-900 mt-4 tracking-tight">
                Classes & Enrollment
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Configure grade sections, map subject curriculums (American / Cambridge), and assign lead educators.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-5 pt-0">
              <span className="text-2xs font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                Configure Sections →
              </span>
            </div>
          </Card>
        </Link>

        <Link href="/school/import" className="group">
          <Card className="h-full rounded-3xl border border-neutral-200/80 hover:border-amber-400 transition-all duration-200 hover:shadow-lg bg-white overflow-hidden flex flex-col justify-between">
            <div className="h-1.5 w-full bg-amber-500" />
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </div>
              <CardTitle className="text-lg font-extrabold text-navy-900 mt-4 tracking-tight">
                Spreadsheet Import
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Download the standardized Excel roster template, bulk upload students & teachers, and export printable login cards.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-5 pt-0">
              <span className="text-2xs font-bold text-amber-600 group-hover:underline flex items-center gap-1">
                Launch Wizard →
              </span>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
