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
        <div className="h-8 w-48 bg-neutral-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-neutral-200 rounded-lg" />
          <div className="h-28 bg-neutral-200 rounded-lg" />
          <div className="h-28 bg-neutral-200 rounded-lg" />
          <div className="h-28 bg-neutral-200 rounded-lg" />
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">School Overview</h1>
          <p className="text-sm text-neutral-600">
            Monitor student activity, teacher staffing, safety alerts, and AI resource usage
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button asChild variant="primary" size="md">
            <Link href="/school/import" className="gap-2">
              <Upload className="h-4 w-4" />
              <span>Import People</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Safety Alerts Banner (US-SCH-01) */}
      {safetyAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-semantic-danger shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Safety Concerns Detected</h3>
              <Badge variant="danger">{safetyAlerts.length} Flagged</Badge>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              One or more student sessions triggered a safety keyword (e.g. distress or feeling unsafe). Please coordinate with school counselors or the assigned teacher.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary-600" />
              Enrolled Students
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-navy-900">
              {studentCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-600">Across Grades 6, 7 & 8</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
              Active Teachers
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-navy-900">
              {teacherCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-600">Math, Science, English</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-semantic-success" />
              Active Users (7 Days)
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-navy-900">
              {activeUsers7d}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-neutral-600">Students & teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-accent-500" />
              AI Tokens Today
            </CardDescription>
            <CardTitle className="text-2xl font-extrabold text-navy-900">
              {(tokensUsedToday / 1000).toFixed(1)}k
              <span className="text-xs font-normal text-neutral-600 ml-1">
                / {(dailyTokenCap / 1000).toLocaleString()}k
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${tokenUsagePercent}%` }}
              />
            </div>
            <p className="text-2xs text-neutral-600">{tokenUsagePercent}% of daily limit used</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link href="/school/users" className="group">
          <Card className="h-full hover:border-primary-300 transition-all shadow-xs hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-bold text-navy-900 mt-3">
                People & Access Codes
              </CardTitle>
              <CardDescription className="text-xs">
                View student and teacher rosters, search, and regenerate forgotten access codes.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/school/classes" className="group">
          <Card className="h-full hover:border-primary-300 transition-all shadow-xs hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-bold text-navy-900 mt-3">
                Classes & Enrollment
              </CardTitle>
              <CardDescription className="text-xs">
                Manage section groupings, assign teachers by subject, and view student lists.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/school/import" className="group">
          <Card className="h-full hover:border-primary-300 transition-all shadow-xs hover:shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <CardTitle className="text-base font-bold text-navy-900 mt-3">
                Spreadsheet Import
              </CardTitle>
              <CardDescription className="text-xs">
                Download the Excel template, upload school rosters, and print login cards in batch.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
