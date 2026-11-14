"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LevelChip } from "@/components/ui/level-chip";
import { AnimatedCounter, StaggerContainer, StaggerItem, HoverSpring } from "@/components/ui/motion";
import { RafiqMascot } from "@/components/ui/mascot";
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
  Star,
  Trophy,
  Flame,
  Rocket,
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
      label: "Math Adventure",
      arabic: "رياضيات",
      icon: Calculator,
      color: "bg-amber-100 text-amber-900 border-amber-300",
      btnVariant: "fun-yellow" as const,
      borderL: "border-l-amber-500",
    },
    science: {
      label: "Science Lab",
      arabic: "علوم",
      icon: FlaskConical,
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
      btnVariant: "fun-green" as const,
      borderL: "border-l-emerald-500",
    },
    english: {
      label: "Language Magic",
      arabic: "لغة إنجليزية",
      icon: BookOpen,
      color: "bg-sky-100 text-sky-900 border-sky-300",
      btnVariant: "fun-blue" as const,
      borderL: "border-l-sky-500",
    },
  };

  const dueSoonList = missions.filter((m) => m.assignmentStatus !== "completed");
  const completedList = missions.filter((m) => m.assignmentStatus === "completed");

  return (
    <div className="space-y-8 pb-12">
      {/* Cheerful Quest Banner with Mascot */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-3xl bg-amber-400 p-6 sm:p-8 text-neutral-950 border-4 border-amber-500 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 max-w-xl">
            <RafiqMascot size="lg" expression="waving" className="shrink-0 hidden sm:flex" />
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-xs font-black uppercase tracking-wider text-amber-900 border border-amber-500 shadow-2xs">
                <Rocket className="h-3.5 w-3.5 text-amber-600" />
                <span>My Learning Adventure</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready for Today&apos;s Quests? 🚀
              </h1>
              <p className="text-sm font-bold text-neutral-900 leading-relaxed">
                Step-by-step interactive practice. Ask Rafiq for clues and conquer your challenges at your own pace!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white px-5 py-3.5 rounded-2xl text-center border-2 border-neutral-900 shadow-md"
            >
              <div className="text-3xl font-black text-amber-600">
                <AnimatedCounter value={dueSoonList.length} />
              </div>
              <div className="text-[11px] font-black text-neutral-700 uppercase tracking-wider mt-0.5">To Do ⭐</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white px-5 py-3.5 rounded-2xl text-center border-2 border-neutral-900 shadow-md"
            >
              <div className="text-3xl font-black text-emerald-600">
                <AnimatedCounter value={completedList.length} />
              </div>
              <div className="text-[11px] font-black text-neutral-700 uppercase tracking-wider mt-0.5">Mastered 🏆</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-amber-100/60 rounded-3xl" />
          <div className="h-32 bg-amber-100/60 rounded-3xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border-4 border-dashed border-amber-300 bg-white">
          <RafiqMascot size="lg" expression="happy" className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-black text-neutral-900">All caught up! 🎉</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-2 text-neutral-600 font-bold">
            You don&apos;t have any pending quests right now. Check back soon when your teacher assigns the next fun challenge!
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active / Due Soon Quests */}
          {dueSoonList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Quests Ready to Play ({dueSoonList.length})</span>
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
                          className={`rounded-3xl border-3 border-amber-200 bg-white border-l-8 ${subj.borderL} p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${subj.color}`}>
                                <Icon className="h-3.5 w-3.5" />
                                <span>{subj.label}</span>
                              </span>
                              <span className="text-neutral-300">•</span>
                              <span className="text-xs font-bold text-neutral-600">
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

                            <h3 className="text-lg font-black text-neutral-900 group-hover:text-amber-700 transition-colors">
                              {item.title}
                            </h3>

                            {item.instructions && (
                              <p className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed">
                                {item.instructions}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            <Button asChild variant={subj.btnVariant} size="md">
                              <Link href={`/missions/${item.assignmentId}`}>
                                <span>Start Quest 🎮</span>
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
            <div className="space-y-4 pt-4 border-t-2 border-amber-200">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>Completed Quests & Star Badges ({completedList.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;

                  return (
                    <div
                      key={item.assignmentId}
                      className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/40 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-0.5 rounded-full border ${subj.color}`}>
                          <Icon className="h-3 w-3" />
                          <span>{subj.label}</span>
                        </span>
                        {item.evaluation?.level && (
                          <LevelChip level={item.evaluation.level} size="sm" />
                        )}
                      </div>

                      <h4 className="text-base font-black text-neutral-900">
                        {item.title}
                      </h4>

                      {item.evaluation?.studentSummary && (
                        <p className="text-xs font-medium text-neutral-700 line-clamp-2">
                          {item.evaluation.studentSummary}
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mastered</span>
                        </span>

                        <Button asChild variant="fun-white" size="sm">
                          <Link href={`/missions/${item.assignmentId}`}>
                            Review Quest
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
