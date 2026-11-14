"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelChip } from "@/components/ui/level-chip";
import { AnimatedCounter, StaggerContainer, StaggerItem, HoverSpring } from "@/components/ui/motion";
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
      bgLight: "bg-indigo-50/80",
      textColor: "text-indigo-600",
      borderColor: "border-l-indigo-600",
      shadow: "shadow-indigo-500/10",
    },
    science: {
      label: "Science",
      arabic: "علوم",
      icon: FlaskConical,
      gradient: "from-emerald-600 to-teal-600",
      bgLight: "bg-emerald-50/80",
      textColor: "text-emerald-600",
      borderColor: "border-l-emerald-600",
      shadow: "shadow-emerald-500/10",
    },
    english: {
      label: "English",
      arabic: "لغة إنجليزية",
      icon: BookOpen,
      gradient: "from-rose-600 to-pink-600",
      bgLight: "bg-rose-50/80",
      textColor: "text-rose-600",
      borderColor: "border-l-rose-600",
      shadow: "shadow-rose-500/10",
    },
  };

  const dueSoonList = missions.filter((m) => m.assignmentStatus !== "completed");
  const completedList = missions.filter((m) => m.assignmentStatus === "completed");

  return (
    <div className="space-y-8 pb-12">
      {/* Motivational Banner with animated floating gradient */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-r from-indigo-600 via-primary-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
      >
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Socratic AI Study Companion</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              My Learning Missions
            </h1>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Step-by-step interactive practice. Talk with Rafiq to conquer challenging concepts at your own speed!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/15 backdrop-blur-md px-5 py-3.5 rounded-2xl text-center border border-white/20 shadow-xs"
            >
              <div className="text-3xl font-black">
                <AnimatedCounter value={dueSoonList.length} />
              </div>
              <div className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider mt-0.5">To Do</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/15 backdrop-blur-md px-5 py-3.5 rounded-2xl text-center border border-white/20 shadow-xs"
            >
              <div className="text-3xl font-black text-emerald-300">
                <AnimatedCounter value={completedList.length} />
              </div>
              <div className="text-[11px] font-bold text-indigo-100 uppercase tracking-wider mt-0.5">Mastered</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-neutral-200/60 rounded-3xl" />
          <div className="h-32 bg-neutral-200/60 rounded-3xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border-2 border-dashed border-neutral-200 bg-white">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-black text-navy-900">All caught up!</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-2 text-neutral-500">
            You don&apos;t have any pending missions. Check back soon when your teacher assigns the next challenge!
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active / Due Soon */}
          {dueSoonList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Assignments to Complete ({dueSoonList.length})</span>
                </h2>
              </div>

              <StaggerContainer className="space-y-3.5">
                {dueSoonList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;
                  const relativeDue = getRelativeTimeString(item.dueAt);
                  const isOverdue = relativeDue.includes("Overdue");

                  return (
                    <StaggerItem key={item.assignmentId}>
                      <HoverSpring scale={1.01} y={-3}>
                        <div
                          className={`rounded-3xl border border-neutral-200/90 bg-white border-l-4 ${subj.borderColor} p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full ${subj.bgLight} ${subj.textColor}`}>
                                <Icon className="h-3.5 w-3.5" />
                                <span>{subj.label}</span>
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-xs font-bold text-neutral-500">
                                Grade {item.grade} ({item.curriculum})
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span
                                className={`text-xs font-bold flex items-center gap-1 ${
                                  isOverdue ? "text-rose-600 font-black" : "text-neutral-500"
                                }`}
                              >
                                <Clock className="h-3.5 w-3.5" />
                                <span>{relativeDue || `Due ${formatDateTime(item.dueAt)}`}</span>
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-navy-900 group-hover:text-primary-600 transition-colors">
                              {item.title}
                            </h3>

                            {item.instructions && (
                              <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                                {item.instructions}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <Button asChild variant="primary" size="md" className={`shrink-0 font-bold gap-2 rounded-xl shadow-md bg-gradient-to-r ${subj.gradient}`}>
                              <Link href={`/missions/${item.assignmentId}`}>
                                <span>{item.assignmentStatus === "in_progress" ? "Resume Mission" : "Start Mission"}</span>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </HoverSpring>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}

          {/* Completed Missions */}
          {completedList.length > 0 && (
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Completed Missions ({completedList.length})</span>
              </h2>

              <StaggerContainer className="space-y-3.5">
                {completedList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;

                  return (
                    <StaggerItem key={item.assignmentId}>
                      <HoverSpring scale={1.01} y={-2}>
                        <div
                          className="rounded-3xl border border-neutral-200/80 bg-neutral-50/70 p-5 sm:p-6 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${subj.bgLight} ${subj.textColor}`}>
                                <Icon className="h-3.5 w-3.5" />
                                <span>{subj.label}</span>
                              </span>
                              {item.evaluation?.level && (
                                <LevelChip level={item.evaluation.level} size="sm" />
                              )}
                              <span className="text-neutral-300">•</span>
                              <span className="text-xs text-neutral-500 font-medium">
                                Completed {formatDateTime(item.completedAt)}
                              </span>
                            </div>

                            <h3 className="text-base font-black text-navy-900">
                              {item.title}
                            </h3>

                            {item.evaluation?.studentSummary && (
                              <p className="text-xs text-neutral-600 bg-white p-3.5 rounded-2xl border border-neutral-200/80 leading-relaxed">
                                <strong>Feedback:</strong> {item.evaluation.studentSummary}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            <Button asChild variant="secondary" size="sm" className="font-bold text-xs rounded-xl">
                              <Link href={`/missions/${item.assignmentId}`}>
                                Review Dialogue
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </HoverSpring>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
