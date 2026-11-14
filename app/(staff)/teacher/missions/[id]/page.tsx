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
        <div className="h-8 w-64 bg-neutral-200 rounded" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-200 rounded" />
          <div className="h-24 bg-neutral-200 rounded" />
          <div className="h-24 bg-neutral-200 rounded" />
          <div className="h-24 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data?.mission) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-neutral-600">Mission results not available</p>
      </div>
    );
  }

  const { mission, stats, commonGaps = [], students = [] } = data;
  const levelCounts = stats.levelCounts || { mastered: 0, proficient: 0, developing: 0, needs_support: 0 };
  const totalScored = Object.values(levelCounts).reduce((a: any, b: any) => a + b, 0) as number;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5">
            <Link href="/teacher">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="uppercase font-bold text-2xs">
                {mission.subject}
              </Badge>
              <span className="text-xs text-neutral-600">
                Grade {mission.grade} ({mission.curriculum})
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs text-neutral-600">
                Due: {formatDateTime(mission.dueAt)}
              </span>
              <Badge
                variant={
                  mission.status === "published"
                    ? "success"
                    : mission.status === "closed"
                    ? "default"
                    : "warning"
                }
              >
                {mission.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 mt-1">{mission.title}</h1>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("xlsx")}
            className="gap-1.5 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-primary-600" />
            <span>Export Excel</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("pdf")}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-4 w-4 text-primary-600" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-2xs font-semibold text-neutral-600 uppercase">Assigned</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.assigned}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-2xs font-semibold text-neutral-600 uppercase">Started</CardDescription>
            <CardTitle className="text-2xl font-bold">{stats.started}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-2xs font-semibold text-neutral-600 uppercase">Completed</CardDescription>
            <CardTitle className="text-2xl font-bold text-semantic-success">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardDescription className="text-2xs font-semibold text-neutral-600 uppercase">Average Score</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary-700">
              {stats.averageScore ? `${stats.averageScore}/100` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Mastery Level Distribution & Common Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribution bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Mastery Level Distribution</CardTitle>
            <CardDescription className="text-xs">
              Based on {totalScored} completed student evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-6 w-full rounded-md overflow-hidden flex bg-neutral-100">
              {totalScored > 0 ? (
                <>
                  <div
                    style={{ width: `${(levelCounts.mastered / totalScored) * 100}%` }}
                    className="bg-[#1E7B4B] h-full"
                    title={`Mastered: ${levelCounts.mastered}`}
                  />
                  <div
                    style={{ width: `${(levelCounts.proficient / totalScored) * 100}%` }}
                    className="bg-[#1F63B5] h-full"
                    title={`Proficient: ${levelCounts.proficient}`}
                  />
                  <div
                    style={{ width: `${(levelCounts.developing / totalScored) * 100}%` }}
                    className="bg-[#A86412] h-full"
                    title={`Developing: ${levelCounts.developing}`}
                  />
                  <div
                    style={{ width: `${(levelCounts.needs_support / totalScored) * 100}%` }}
                    className="bg-[#B5532A] h-full"
                    title={`Needs Support: ${levelCounts.needs_support}`}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xs text-neutral-400">
                  No completed sessions yet
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#1E7B4B]" />
                <span className="font-semibold text-neutral-800">Mastered:</span>
                <span className="text-neutral-600">{levelCounts.mastered}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#1F63B5]" />
                <span className="font-semibold text-neutral-800">Getting strong:</span>
                <span className="text-neutral-600">{levelCounts.proficient}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#A86412]" />
                <span className="font-semibold text-neutral-800">Making progress:</span>
                <span className="text-neutral-600">{levelCounts.developing}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-xs bg-[#B5532A]" />
                <span className="font-semibold text-neutral-800">Needs practice:</span>
                <span className="text-neutral-600">{levelCounts.needs_support}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Gaps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Identified Learning Gaps</CardTitle>
            <CardDescription className="text-xs">
              Most frequent misconceptions observed during practice problems
            </CardDescription>
          </CardHeader>
          <CardContent>
            {commonGaps.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">
                No common misconception tags identified yet.
              </p>
            ) : (
              <div className="space-y-3">
                {commonGaps.slice(0, 4).map((gap: any, i: number) => {
                  const pct = Math.round((gap.count / Math.max(1, stats.completed)) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-900 capitalize">
                          {gap.tag.replace(/_/g, " ")}
                        </span>
                        <span className="text-neutral-600 font-mono">
                          {gap.count} students ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-2xs text-neutral-600 line-clamp-1">{gap.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Roster Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Results Roster</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-neutral-50 text-xs font-semibold text-neutral-600 uppercase border-y border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-start">Student Name</th>
                  <th className="px-6 py-3 text-start">Status</th>
                  <th className="px-6 py-3 text-start">Mastery Level</th>
                  <th className="px-6 py-3 text-end">Score</th>
                  <th className="px-6 py-3 text-end">Hints</th>
                  <th className="px-6 py-3 text-center">Flags</th>
                  <th className="px-6 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {students.map((s: any) => (
                  <tr key={s.assignmentId} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-navy-900">
                      {s.studentName}
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
                        className="capitalize"
                      >
                        {s.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <LevelChip level={s.level} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-end font-mono font-bold text-navy-900">
                      {s.score !== null ? `${s.score}/100` : "—"}
                    </td>
                    <td className="px-6 py-4 text-end font-mono text-xs">
                      {s.hintsUsed > 0 ? s.hintsUsed : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.safetyFlag ? <SafetyBadge /> : "—"}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        {s.status !== "not_started" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenDrillDown(s)}
                            className="text-xs"
                          >
                            Transcript
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetAssignment(s.assignmentId, s.studentName)}
                          isLoading={resettingId === s.assignmentId}
                          title="Reset assignment"
                          className="text-xs text-neutral-500 hover:text-primary-600"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Drill-Down Transcript Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Student Session: {selectedStudent?.studentName}
            </DialogTitle>
            <DialogDescription>
              Full conversation transcript, practice attempts, and pedagogical summary.
            </DialogDescription>
          </DialogHeader>

          {loadingDrill ? (
            <div className="p-8 text-center text-sm text-neutral-600">Loading transcript...</div>
          ) : drillData ? (
            <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
              {/* Summary Block */}
              {drillData.evaluation && (
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900 uppercase">Evaluation Summary</span>
                    <LevelChip level={drillData.evaluation.level} size="sm" />
                  </div>
                  <p className="text-neutral-800">{drillData.evaluation.teacherSummary}</p>
                </div>
              )}

              {/* Messages list */}
              <div className="space-y-3 pt-2">
                {drillData.messages?.map((m: any) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg text-xs leading-relaxed ${
                        isUser
                          ? "bg-primary-50 border border-primary-200 ms-8"
                          : "bg-surface border border-neutral-200 me-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 text-2xs font-semibold text-neutral-500">
                        <span>{isUser ? "Student" : "Rafiq AI"}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleOpenFlagDialog(m.id)}
                            className="inline-flex items-center gap-1 text-neutral-400 hover:text-semantic-danger"
                            title="Flag this reply"
                          >
                            <Flag className="h-3 w-3" />
                            <span>Flag</span>
                          </button>
                        )}
                      </div>
                      <MarkdownView content={m.content} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex items-center justify-between">
            {selectedStudent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetAssignment(selectedStudent.assignmentId, selectedStudent.studentName)}
                className="text-xs text-semantic-danger"
              >
                Reset Assignment
              </Button>
            )}
            <Button variant="secondary" onClick={() => setDrillDownOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Message Dialog */}
      <Dialog open={flagOpen} onOpenChange={setFlagOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Flag AI Response</DialogTitle>
            <DialogDescription>
              Help us review and improve tutor accuracy and safety.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFlag} className="space-y-4 py-2">
            <div className="space-y-1.5 text-start">
              <label className="text-sm font-medium text-neutral-900">Reason</label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900"
              >
                <option value="wrong_answer">Wrong Answer / Arithmetic Error</option>
                <option value="unsafe">Unsafe or Inappropriate for Children</option>
                <option value="confusing">Confusing or Pedagogically Flawed</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div className="space-y-1.5 text-start">
              <label className="text-sm font-medium text-neutral-900">Teacher Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="What was incorrect or how should the tutor have handled it?"
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                className="w-full p-2.5 rounded-md border border-neutral-300 text-xs"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFlagOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={flagging}>
                Submit Flag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

