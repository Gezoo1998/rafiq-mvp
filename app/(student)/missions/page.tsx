"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelChip } from "@/components/ui/level-chip";
import {
  Calculator,
  FlaskConical,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { formatDateTime, getRelativeTimeString } from "@/lib/utils";

interface StudentMissionItem {
  assignmentId: string;
  assignmentStatus: "not_started" | "in_progress" | "completed" | "evaluation_failed";
  startedAt: string | null;
  completedAt: string | null;
  missionId: string;
  title: string;
  instructions: string | null;
  subject: "math" | "science" | "english";
  grade: number;
  curriculum: string;
  languageMode: string;
  dueAt: string;
  evaluation?: {
    level: any;
    studentSummary: string;
    strengths: string[];
    nextStep: string;
  } | null;
}

export default function StudentMissionsPage() {
  const [missions, setMissions] = React.useState<StudentMissionItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/student/missions");
        const data = await res.json();
        if (res.ok) setMissions(data.assignments || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjectConfig = {
    math: {
      label: "Math",
      arabic: "رياضيات",
      icon: Calculator,
      gradient: "from-indigo-600 to-purple-600",
      bgLight: "bg-indigo-50/70 dark:bg-indigo-950/30",
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-l-indigo-600",
      shadow: "shadow-indigo-500/10",
    },
    science: {
      label: "Science",
      arabic: "علوم",
      icon: FlaskConical,
      gradient: "from-emerald-600 to-teal-600",
      bgLight: "bg-emerald-50/70 dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-l-emerald-600",
      shadow: "shadow-emerald-500/10",
    },
    english: {
      label: "English",
      arabic: "لغة إنجليزية",
      icon: BookOpen,
      gradient: "from-rose-600 to-pink-600",
      bgLight: "bg-rose-50/70 dark:bg-rose-950/30",
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-l-rose-600",
      shadow: "shadow-rose-500/10",
    },
  };

  const dueSoonList = missions.filter((m) => m.assignmentStatus !== "completed");
  const completedList = missions.filter((m) => m.assignmentStatus === "completed");

  return (
    <div className="space-y-8">
      {/* Motivational Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Socratic AI Study Companion</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Learning Missions
            </h1>
            <p className="text-sm text-indigo-100 max-w-md">
              Step-by-step Socratic practice. Work with Rafiq to master tough concepts without pressure!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
              <div className="text-2xl font-black">{dueSoonList.length}</div>
              <div className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">To Do</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
              <div className="text-2xl font-black text-emerald-300">{completedList.length}</div>
              <div className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-neutral-200/60 dark:bg-neutral-800 rounded-2xl" />
          <div className="h-32 bg-neutral-200/60 dark:bg-neutral-800 rounded-2xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-black text-navy-900 dark:text-white">All caught up!</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-2 text-neutral-500">
            You don't have any pending missions. Check back soon when your teacher assigns the next challenge!
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active / Due Soon */}
          {dueSoonList.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Assignments to Complete ({dueSoonList.length})</span>
                </h2>
              </div>

              <div className="space-y-3">
                {dueSoonList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;
                  const relativeDue = getRelativeTimeString(item.dueAt);
                  const isOverdue = relativeDue.includes("Overdue");

                  return (
                    <div
                      key={item.assignmentId}
                      className={`rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 border-l-4 ${subj.borderColor} p-5 hover:shadow-lg transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-0.5 rounded-full ${subj.bgLight} ${subj.textColor}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span>{subj.label}</span>
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-xs font-bold text-neutral-500">
                            Grade {item.grade} ({item.curriculum})
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span
                            className={`text-xs font-bold flex items-center gap-1 ${
                              isOverdue ? "text-rose-600 dark:text-rose-400 font-black" : "text-neutral-500"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>{relativeDue || `Due ${formatDateTime(item.dueAt)}`}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-navy-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h3>

                        {item.instructions && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                            {item.instructions}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <Button asChild variant="primary" size="md" className={`shrink-0 font-bold gap-2 shadow-md bg-gradient-to-r ${subj.gradient}`}>
                          <Link href={`/missions/${item.assignmentId}`}>
                            <span>{item.assignmentStatus === "in_progress" ? "Resume Mission" : "Start Mission"}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Missions */}
          {completedList.length > 0 && (
            <div className="space-y-3.5 pt-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Completed Missions ({completedList.length})</span>
              </h2>

              <div className="space-y-3">
                {completedList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;

                  return (
                    <div
                      key={item.assignmentId}
                      className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 p-5 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${subj.bgLight} ${subj.textColor}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span>{subj.label}</span>
                          </span>
                          {item.evaluation?.level && (
                            <LevelChip level={item.evaluation.level} size="sm" />
                          )}
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-xs text-neutral-500 font-medium">
                            Completed {formatDateTime(item.completedAt)}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-navy-900 dark:text-white">
                          {item.title}
                        </h3>

                        {item.evaluation?.studentSummary && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-850 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                            <strong>Feedback:</strong> {item.evaluation.studentSummary}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button asChild variant="secondary" size="sm" className="font-bold text-xs">
                          <Link href={`/missions/${item.assignmentId}`}>
                            Review Dialogue
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
