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
      icon: Calculator,
      color: "bg-[#4C4FD6]",
      textColor: "text-[#4C4FD6]",
      borderColor: "border-l-[#4C4FD6]",
    },
    science: {
      label: "Science",
      icon: FlaskConical,
      color: "bg-[#2A8A4A]",
      textColor: "text-[#2A8A4A]",
      borderColor: "border-l-[#2A8A4A]",
    },
    english: {
      label: "English",
      icon: BookOpen,
      color: "bg-[#B8438A]",
      textColor: "text-[#B8438A]",
      borderColor: "border-l-[#B8438A]",
    },
  };

  const dueSoonList = missions.filter((m) => m.assignmentStatus !== "completed");
  const completedList = missions.filter((m) => m.assignmentStatus === "completed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">My Missions</h1>
        <p className="text-sm text-neutral-600">
          Pick a mission to study with Rafiq. Learn step-by-step and practice!
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-neutral-200/60 rounded-xl" />
          <div className="h-28 bg-neutral-200/60 rounded-xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="h-12 w-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">No missions assigned yet</CardTitle>
          <CardDescription className="max-w-xs mx-auto mt-1">
            When your teacher assigns a new mission, it will appear right here. Check back soon!
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active / Due Soon */}
          {dueSoonList.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                To Do ({dueSoonList.length})
              </h2>
              <div className="space-y-3">
                {dueSoonList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;
                  const relativeDue = getRelativeTimeString(item.dueAt);
                  const isOverdue = relativeDue.includes("Overdue");

                  return (
                    <Card
                      key={item.assignmentId}
                      className={`border-l-4 ${subj.borderColor} hover:shadow-md transition-shadow`}
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${subj.textColor}`}>
                              <Icon className="h-3.5 w-3.5" />
                              <span>{subj.label}</span>
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span
                              className={`text-xs font-semibold flex items-center gap-1 ${
                                isOverdue ? "text-semantic-danger" : "text-neutral-600"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>{relativeDue}</span>
                            </span>
                            {item.assignmentStatus === "in_progress" && (
                              <Badge variant="primary" className="text-2xs">
                                In Progress
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-snug">
                            {item.title}
                          </h3>

                          {item.instructions && (
                            <p className="text-xs text-neutral-600 line-clamp-1">
                              {item.instructions}
                            </p>
                          )}
                        </div>

                        <Button asChild variant="primary" size="md" className="shrink-0 font-semibold gap-1.5">
                          <Link href={`/missions/${item.assignmentId}`}>
                            <span>{item.assignmentStatus === "in_progress" ? "Continue" : "Start Mission"}</span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Missions */}
          {completedList.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Completed ({completedList.length})
              </h2>
              <div className="space-y-3">
                {completedList.map((item) => {
                  const subj = subjectConfig[item.subject] || subjectConfig.math;
                  const Icon = subj.icon;

                  return (
                    <Card
                      key={item.assignmentId}
                      className="opacity-95 hover:opacity-100 transition-opacity"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${subj.textColor}`}>
                              <Icon className="h-3.5 w-3.5" />
                              <span>{subj.label}</span>
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="text-xs text-neutral-500">
                              Completed {formatDateTime(item.completedAt)}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-navy-900">{item.title}</h3>

                          {item.evaluation && (
                            <div className="flex items-center gap-2 pt-1">
                              <LevelChip level={item.evaluation.level} size="sm" />
                              {item.evaluation.strengths?.[0] && (
                                <span className="text-xs text-neutral-600 truncate">
                                  "{item.evaluation.strengths[0]}"
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <Button asChild variant="secondary" size="sm" className="shrink-0 text-xs">
                          <Link href={`/missions/${item.assignmentId}`}>
                            <span>Review Session</span>
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
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
