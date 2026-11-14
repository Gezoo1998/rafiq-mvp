"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelChip, MasteryLevel, SafetyBadge } from "@/components/ui/level-chip";
import { MarkdownView } from "@/components/domain/MarkdownView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Printer,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  Flag,
  FileText,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function MissionResultsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Student drill-down state
  const [drillDownOpen, setDrillDownOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [drillData, setDrillData] = React.useState<any>(null);
  const [loadingDrill, setLoadingDrill] = React.useState(false);

  // Resetting state
  const [resettingId, setResettingId] = React.useState<string | null>(null);

  // Flag message state
  const [flagOpen, setFlagOpen] = React.useState(false);
  const [flaggingMessageId, setFlaggingMessageId] = React.useState<number | null>(null);
  const [flagReason, setFlagReason] = React.useState<"wrong_answer" | "unsafe" | "confusing" | "other">("wrong_answer");
  const [flagNote, setFlagNote] = React.useState("");
  const [flagging, setFlagging] = React.useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/missions/${missionId}/results`);
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (missionId) fetchResults();
  }, [missionId]);

  const handleOpenDrillDown = async (student: any) => {
    setSelectedStudent(student);
    setDrillDownOpen(true);
    setLoadingDrill(true);
    try {
      const res = await fetch(`/api/missions/${missionId}/students/${student.studentId}`);
      const json = await res.json();
      if (res.ok) setDrillData(json);
    } finally {
      setLoadingDrill(false);
    }
  };

  const handleResetAssignment = async (assignmentId: string, studentName: string) => {
    if (!confirm(`Reset mission assignment for ${studentName}? The previous session will be archived and the student will be able to start fresh.`)) {
      return;
    }

    setResettingId(assignmentId);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/reset`, {
        method: "POST",
      });
      if (res.ok) {
        if (drillDownOpen) setDrillDownOpen(false);
        fetchResults();
      }
    } finally {
      setResettingId(null);
    }
  };

  const handleExport = (format: "xlsx" | "pdf") => {
    if (format === "xlsx") {
      window.location.href = `/api/missions/${missionId}/export?format=xlsx`;
    } else {
      window.open(`/api/missions/${missionId}/export?format=pdf`, "_blank");
    }
  };

  const handleOpenFlagDialog = (messageId: number) => {
    setFlaggingMessageId(messageId);
    setFlagReason("wrong_answer");
    setFlagNote("");
    setFlagOpen(true);
  };

  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flaggingMessageId) return;

    setFlagging(true);
    try {
      const res = await fetch(`/api/messages/${flaggingMessageId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: flagReason,
          note: flagNote.trim() || null,
        }),
      });

      if (res.ok) {
        setFlagOpen(false);
        alert("Thank you! Your feedback has been recorded for review.");
      }
    } finally {
      setFlagging(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-neutral-200/70 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-neutral-200/60 rounded-2xl" />
          <div className="h-28 bg-neutral-200/60 rounded-2xl" />
          <div className="h-28 bg-neutral-200/60 rounded-2xl" />
          <div className="h-28 bg-neutral-200/60 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-neutral-200/50 rounded-2xl" />
          <div className="h-64 bg-neutral-200/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data?.mission) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-navy-900">Mission results not available</h3>
        <p className="text-sm text-neutral-500 mt-1 mb-6">The requested mission data could not be found or has been removed.</p>
        <Button asChild variant="primary">
          <Link href="/teacher">Back to Teacher Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { mission, stats, commonGaps = [], students = [] } = data;
  const levelCounts = stats.levelCounts || { mastered: 0, proficient: 0, developing: 0, needs_support: 0 };
  const totalScored = Object.values(levelCounts).reduce((a: any, b: any) => a + b, 0) as number;

  const subjectGradient =
    mission.subject === "math"
      ? "from-indigo-900 via-indigo-950 to-navy-900"
      : mission.subject === "science"
      ? "from-emerald-950 via-teal-950 to-navy-900"
      : "from-rose-950 via-pink-950 to-navy-900";

  const completionRate = stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${subjectGradient} p-6 sm:p-8 text-white shadow-xl`}>
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary-500/10 blur-2xl translate-y-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 -ml-2">
                <Link href="/teacher">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Teacher Home
                </Link>
              </Button>
              <span className="text-white/30">|</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/20">
                {mission.subject}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90">
                Grade {mission.grade} • {mission.curriculum}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  mission.status === "published"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : mission.status === "closed"
                    ? "bg-white/10 text-white/70"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                ● {mission.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{mission.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/75 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-white/60" />
                <span>Due: {formatDateTime(mission.dueAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>{completionRate}% Completion Rate</span>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("xlsx")}
              className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md rounded-xl transition-all shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-300" />
              <span>Export Excel</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md rounded-xl transition-all shadow-sm"
            >
              <Printer className="h-4 w-4 text-indigo-300" />
              <span>Print PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Assigned Students
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">{stats.assigned}</CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Across enrolled target classes
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                In Progress
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-navy-900 mt-1">{stats.started}</CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Currently working with Rafiq AI
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Completed
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-emerald-600 mt-1">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            {completionRate}% completion rate
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-shadow">
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-primary-600" />
          <CardHeader className="pb-1 pt-4">
            <div className="flex items-center justify-between">
              <CardDescription className="text-2xs font-bold uppercase tracking-wider text-neutral-500">
                Average Mastery
              </CardDescription>
              <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-primary-600 mt-1">
              {stats.averageScore ? `${stats.averageScore}%` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1 pb-4 text-xs text-neutral-500">
            Based on completed evaluations
          </CardContent>
        </Card>
      </div>

      {/* Analytics Row: Mastery Level Distribution & Common Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastery Distribution Card */}
        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">Mastery Level Distribution</CardTitle>
                <CardDescription className="text-xs">
                  {totalScored} student evaluation{totalScored === 1 ? "" : "s"} aggregated
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Visual Segmented Progress Bar */}
            <div className="space-y-2">
              <div className="h-7 w-full rounded-full overflow-hidden flex bg-neutral-100 p-1 shadow-inner">
                {totalScored > 0 ? (
                  <>
                    {levelCounts.mastered > 0 && (
                      <div
                        style={{ width: `${(levelCounts.mastered / totalScored) * 100}%` }}
                        className="bg-emerald-500 hover:bg-emerald-600 h-full rounded-l-full transition-all"
                        title={`Mastered: ${levelCounts.mastered} (${Math.round((levelCounts.mastered / totalScored) * 100)}%)`}
                      />
                    )}
                    {levelCounts.proficient > 0 && (
                      <div
                        style={{ width: `${(levelCounts.proficient / totalScored) * 100}%` }}
                        className="bg-sky-500 hover:bg-sky-600 h-full transition-all"
                        title={`Proficient: ${levelCounts.proficient} (${Math.round((levelCounts.proficient / totalScored) * 100)}%)`}
                      />
                    )}
                    {levelCounts.developing > 0 && (
                      <div
                        style={{ width: `${(levelCounts.developing / totalScored) * 100}%` }}
                        className="bg-amber-500 hover:bg-amber-600 h-full transition-all"
                        title={`Developing: ${levelCounts.developing} (${Math.round((levelCounts.developing / totalScored) * 100)}%)`}
                      />
                    )}
                    {levelCounts.needs_support > 0 && (
                      <div
                        style={{ width: `${(levelCounts.needs_support / totalScored) * 100}%` }}
                        className="bg-rose-500 hover:bg-rose-600 h-full rounded-r-full transition-all"
                        title={`Needs Support: ${levelCounts.needs_support} (${Math.round((levelCounts.needs_support / totalScored) * 100)}%)`}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                    No completed sessions yet
                  </div>
                )}
              </div>
            </div>

            {/* Level Legend Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-900">Mastered</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-900">{levelCounts.mastered}</span>
                  <span className="text-2xs text-emerald-700 ml-1">
                    ({totalScored > 0 ? Math.round((levelCounts.mastered / totalScored) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-sky-500" />
                  <span className="font-bold text-sky-900">Proficient</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sky-900">{levelCounts.proficient}</span>
                  <span className="text-2xs text-sky-700 ml-1">
                    ({totalScored > 0 ? Math.round((levelCounts.proficient / totalScored) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-900">Developing</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-amber-900">{levelCounts.developing}</span>
                  <span className="text-2xs text-amber-700 ml-1">
                    ({totalScored > 0 ? Math.round((levelCounts.developing / totalScored) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="font-bold text-rose-900">Needs Support</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-rose-900">{levelCounts.needs_support}</span>
                  <span className="text-2xs text-rose-700 ml-1">
                    ({totalScored > 0 ? Math.round((levelCounts.needs_support / totalScored) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Learning Gaps */}
        <Card className="rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-3 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy-900">Common Learning Misconceptions</CardTitle>
                <CardDescription className="text-xs">
                  Frequently identified gaps requiring targeted reinforcement
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {commonGaps.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-neutral-700">No major misconceptions detected</p>
                <p className="text-xs text-neutral-400">Students are demonstrating consistent understanding across concepts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commonGaps.slice(0, 4).map((gap: any, i: number) => {
                  const pct = Math.round((gap.count / Math.max(1, stats.completed)) * 100);
                  return (
                    <div key={i} className="space-y-1.5 p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-900 capitalize flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          {gap.tag.replace(/_/g, " ")}
                        </span>
                        <span className="text-neutral-600 font-mono font-bold">
                          {gap.count} student{gap.count === 1 ? "" : "s"} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200/80 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-2xs text-neutral-600 line-clamp-1 italic">{gap.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Results Table */}
      <Card className="rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-neutral-200/80 bg-neutral-50/60 py-5 px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-navy-900">Student Results Roster</CardTitle>
              <CardDescription className="text-xs text-neutral-500">
                Detailed mission performance, socratic transcripts, and evaluation metrics
              </CardDescription>
            </div>
            <Badge variant="primary" className="self-start sm:self-auto text-xs px-3 py-1">
              {students.length} Students Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-neutral-100/60 text-2xs font-bold text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="px-6 sm:px-8 py-3.5 text-start">Student</th>
                  <th className="px-6 py-3.5 text-start">Status</th>
                  <th className="px-6 py-3.5 text-start">Mastery</th>
                  <th className="px-6 py-3.5 text-end">Score</th>
                  <th className="px-6 py-3.5 text-end">Hints</th>
                  <th className="px-6 py-3.5 text-center">Safety</th>
                  <th className="px-6 sm:px-8 py-3.5 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/70">
                {students.map((s: any) => {
                  const initials = s.studentName
                    ? s.studentName
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "ST";

                  return (
                    <tr key={s.assignmentId} className="hover:bg-primary-50/30 transition-colors">
                      <td className="px-6 sm:px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-navy-900 text-sm">{s.studentName}</div>
                            {s.className && <div className="text-2xs text-neutral-500">{s.className}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            s.status === "completed"
                              ? "success"
                              : s.status === "in_progress"
                              ? "primary"
                              : s.status === "evaluation_failed"
                              ? "danger"
                              : "default"
                          }
                          className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        >
                          {s.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <LevelChip level={s.level} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-end">
                        {s.score !== null ? (
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              s.score >= 80 ? "text-emerald-600" : s.score >= 60 ? "text-amber-600" : "text-rose-600"
                            }`}
                          >
                            {s.score}%
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-end font-mono text-xs">
                        {s.hintsUsed > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200">
                            {s.hintsUsed}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {s.safetyFlag ? <SafetyBadge /> : <span className="text-neutral-300">—</span>}
                      </td>
                      <td className="px-6 sm:px-8 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          {s.status !== "not_started" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenDrillDown(s)}
                              className="text-xs h-8 px-3 rounded-lg border-primary-200 text-primary-700 hover:bg-primary-50 font-semibold"
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Transcript
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetAssignment(s.assignmentId, s.studentName)}
                            isLoading={resettingId === s.assignmentId}
                            title="Reset assignment"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-Down Transcript Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gradient-to-r from-navy-900 to-indigo-900 text-white border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Student Session:</span>
                  <span className="text-emerald-400">{selectedStudent?.studentName}</span>
                </DialogTitle>
                <DialogDescription className="text-white/70 text-xs mt-1">
                  Full Socratic dialogue transcript, practice steps, and AI pedagogical evaluation
                </DialogDescription>
              </div>
              {selectedStudent?.level && (
                <LevelChip level={selectedStudent.level} size="sm" />
              )}
            </div>
          </DialogHeader>

          {loadingDrill ? (
            <div className="p-12 text-center text-sm text-neutral-500 space-y-3">
              <Clock className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
              <p>Loading full session transcript...</p>
            </div>
          ) : drillData ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-neutral-50/50">
              {/* Summary Block */}
              {drillData.evaluation && (
                <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-primary-50/80 rounded-2xl border border-primary-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary-600" />
                      Pedagogical Assessment
                    </span>
                    <LevelChip level={drillData.evaluation.level} size="sm" />
                  </div>
                  <p className="text-xs leading-relaxed text-navy-900 font-medium">
                    {drillData.evaluation.teacherSummary}
                  </p>
                  {drillData.evaluation.gaps?.length > 0 && (
                    <div className="pt-2 border-t border-primary-200/50 flex flex-wrap gap-1.5 items-center">
                      <span className="text-2xs font-bold text-primary-800">Identified Gaps:</span>
                      {drillData.evaluation.gaps.map((g: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-2xs bg-rose-100 text-rose-800 font-semibold">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Messages list styled like modern chat bubbles */}
              <div className="space-y-3.5 pt-1">
                {drillData.messages?.map((m: any) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs transition-all ${
                        isUser
                          ? "bg-primary-600 text-white ml-8 rounded-tr-xs"
                          : "bg-white border border-neutral-200/80 text-navy-900 mr-8 rounded-tl-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-2xs font-bold">
                        <span className={isUser ? "text-white/80" : "text-primary-700"}>
                          {isUser ? selectedStudent?.studentName || "Student" : "Rafiq AI Tutor"}
                        </span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleOpenFlagDialog(m.id)}
                            className="inline-flex items-center gap-1 text-neutral-400 hover:text-rose-600 transition-colors"
                            title="Flag this reply for review"
                          >
                            <Flag className="h-3 w-3" />
                            <span>Flag</span>
                          </button>
                        )}
                      </div>
                      <div className={isUser ? "text-white" : "text-neutral-800"}>
                        <MarkdownView content={m.content} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <DialogFooter className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
            {selectedStudent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetAssignment(selectedStudent.assignmentId, selectedStudent.studentName)}
                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
              >
                Reset Assignment
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setDrillDownOpen(false)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Message Dialog */}
      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy-900">Flag AI Response</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Report an inaccurate, unsafe, or pedagogically confusing tutor explanation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFlag} className="space-y-4 py-2">
            <div className="space-y-1.5 text-start">
              <label className="text-xs font-bold text-navy-900">Reason</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 focus:outline-none focus:border-primary-500"
              >
                <option value="wrong_answer">Wrong Answer / Arithmetic Error</option>
                <option value="unsafe">Unsafe or Inappropriate for Children</option>
                <option value="confusing">Confusing or Pedagogically Flawed</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div className="space-y-1.5 text-start">
              <label className="text-xs font-bold text-navy-900">Teacher Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="What was incorrect or how should the tutor have handled it?"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-primary-500"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setFlagOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={flagging} className="text-xs rounded-xl">
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
