"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  BarChart2,
  Trash2,
  Globe,
  Calculator,
  FlaskConical,
  Zap,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { formatDateTime, getRelativeTimeString } from "@/lib/utils";

interface MissionSummary {
  id: string;
  title: string;
  instructions: string | null;
  subject: "math" | "science" | "english";
  grade: number;
  curriculum: string;
  languageMode: string;
  dueAt: string;
  status: "draft" | "published" | "closed";
  publishedAt: string | null;
  closedAt: string | null;
}

export default function TeacherMissionsPage() {
  const [missions, setMissions] = React.useState<MissionSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const url = filterStatus !== "all" ? `/api/missions?status=${filterStatus}` : "/api/missions";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setMissions(data.missions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMissions();
  }, [filterStatus]);

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}/publish`, { method: "POST" });
      if (res.ok) fetchMissions();
    } catch {
      // ignore
    }
  };

  const handleClose = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}/close`, { method: "POST" });
      if (res.ok) fetchMissions();
    } catch {
      // ignore
    }
  };

  const handleReopen = async (id: string) => {
    try {
      const res = await fetch(`/api/missions/${id}/reopen`, { method: "POST" });
      if (res.ok) fetchMissions();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft mission?")) return;
    try {
      const res = await fetch(`/api/missions/${id}`, { method: "DELETE" });
      if (res.ok) fetchMissions();
    } catch {
      // ignore
    }
  };

  const subjectBadges = {
    math: {
      label: "Math",
      icon: Calculator,
      className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    },
    science: {
      label: "Science",
      icon: FlaskConical,
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    },
    english: {
      label: "English",
      icon: BookOpen,
      className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    },
  };

  const publishedCount = missions.filter((m) => m.status === "published").length;
  const draftCount = missions.filter((m) => m.status === "draft").length;
  const closedCount = missions.filter((m) => m.status === "closed").length;

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Missions Mission Control</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              Teacher
            </span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Create interactive Socratic missions, assign target classes, and inspect live student mastery
          </p>
        </div>

        <Button asChild variant="primary" className="gap-2 shrink-0 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-primary-600 font-bold">
          <Link href="/teacher/new">
            <Plus className="h-4 w-4" />
            <span>New Mission</span>
          </Link>
        </Button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-navy-900 dark:text-white">{missions.length}</div>
            <div className="text-xs text-neutral-500 font-semibold">Total Missions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">{publishedCount}</div>
            <div className="text-xs text-neutral-500 font-semibold">Published Active</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600">{draftCount}</div>
            <div className="text-xs text-neutral-500 font-semibold">Draft Missions</div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-black text-purple-600">{closedCount}</div>
            <div className="text-xs text-neutral-500 font-semibold">Completed & Closed</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs">
        {[
          { id: "all", label: "All Missions", count: missions.length },
          { id: "published", label: "Published", count: publishedCount },
          { id: "draft", label: "Drafts", count: draftCount },
          { id: "closed", label: "Closed", count: closedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              filterStatus === tab.id
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === tab.id ? "bg-white/20 text-white" : "bg-neutral-200 dark:bg-neutral-700"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Missions List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-28 bg-neutral-200/50 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-28 bg-neutral-200/50 dark:bg-neutral-800 rounded-2xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-navy-900 dark:text-white">No missions found</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mb-5 max-w-sm mx-auto">
            Get started by creating a 60-second interactive learning mission for your classes.
          </p>
          <Button asChild variant="primary" className="font-bold bg-gradient-to-r from-indigo-600 to-primary-600">
            <Link href="/teacher/new">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create First Mission</span>
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {missions.map((m) => {
            const relativeDue = getRelativeTimeString(m.dueAt);
            const isOverdue = relativeDue.includes("Overdue");
            const subj = subjectBadges[m.subject] || subjectBadges.math;
            const SubjIcon = subj.icon;

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-2xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${subj.className}`}>
                      <SubjIcon className="h-3 w-3" />
                      <span>{subj.label}</span>
                    </span>
                    <span className="text-xs font-bold text-neutral-500">
                      Grade {m.grade} ({m.curriculum})
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span className="text-xs text-neutral-500 font-semibold uppercase">
                      Lang: {m.languageMode}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        isOverdue && m.status === "published"
                          ? "text-rose-600 dark:text-rose-400 font-black"
                          : "text-neutral-500"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      <span>{relativeDue || `Due ${formatDateTime(m.dueAt)}`}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-navy-900 dark:text-white truncate">
                    {m.title}
                  </h3>

                  {m.instructions && (
                    <p className="text-xs text-neutral-500 line-clamp-1">{m.instructions}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Badge
                    variant={
                      m.status === "published"
                        ? "success"
                        : m.status === "closed"
                        ? "default"
                        : "warning"
                    }
                    className="capitalize font-bold text-xs"
                  >
                    {m.status}
                  </Badge>

                  {m.status === "published" && (
                    <>
                      <Button asChild variant="primary" size="sm" className="gap-1.5 font-bold shadow-xs bg-indigo-600 hover:bg-indigo-700">
                        <Link href={`/teacher/missions/${m.id}`}>
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span>Results</span>
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleClose(m.id)}
                        className="text-xs font-bold"
                      >
                        Close
                      </Button>
                    </>
                  )}

                  {m.status === "closed" && (
                    <>
                      <Button asChild variant="primary" size="sm" className="gap-1.5 font-bold bg-indigo-600 hover:bg-indigo-700">
                        <Link href={`/teacher/missions/${m.id}`}>
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span>Results</span>
                        </Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReopen(m.id)}
                        className="text-xs font-bold"
                      >
                        Reopen
                      </Button>
                    </>
                  )}

                  {m.status === "draft" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublish(m.id)}
                        className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Publish</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(m.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
