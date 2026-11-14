"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter, StaggerContainer, StaggerItem, HoverSpring, triggerCelebrationConfetti } from "@/components/ui/motion";
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
      if (res.ok) {
        triggerCelebrationConfetti();
        fetchMissions();
      }
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
      className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    science: {
      label: "Science",
      icon: FlaskConical,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    english: {
      label: "English",
      icon: BookOpen,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  const publishedCount = missions.filter((m) => m.status === "published").length;
  const draftCount = missions.filter((m) => m.status === "draft").length;
  const closedCount = missions.filter((m) => m.status === "closed").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2.5">
            <span>Missions Mission Control</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
              Teacher Faculty
            </span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Author interactive Socratic missions, assign target class cohorts, and inspect live mastery telemetry
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button asChild variant="primary" className="gap-2 shrink-0 shadow-md shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-primary-600 font-bold rounded-xl px-5 h-11">
            <Link href="/teacher/new">
              <Plus className="h-4 w-4" />
              <span>New Mission</span>
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-navy-900">
              <AnimatedCounter value={missions.length} />
            </div>
            <div className="text-xs text-neutral-500 font-semibold">Total Missions</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              <AnimatedCounter value={publishedCount} />
            </div>
            <div className="text-xs text-neutral-500 font-semibold">Published Active</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">
              <AnimatedCounter value={draftCount} />
            </div>
            <div className="text-xs text-neutral-500 font-semibold">Draft Missions</div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <BarChart2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-600">
              <AnimatedCounter value={closedCount} />
            </div>
            <div className="text-xs text-neutral-500 font-semibold">Completed & Closed</div>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs with animated pills */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-xs">
        {[
          { id: "all", label: "All Missions", count: missions.length },
          { id: "published", label: "Published", count: publishedCount },
          { id: "draft", label: "Drafts", count: draftCount },
          { id: "closed", label: "Closed", count: closedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 relative ${
              filterStatus === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${filterStatus === tab.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Missions List */}
      {loading ? (
        <div className="space-y-3.5 animate-pulse">
          <div className="h-28 bg-neutral-200/60 rounded-3xl" />
          <div className="h-28 bg-neutral-200/60 rounded-3xl" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border-2 border-dashed border-neutral-200 bg-white">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-navy-900">No missions found</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mb-5 max-w-sm mx-auto">
            Get started by creating an interactive Socratic learning mission for your classes.
          </p>
          <Button asChild variant="primary" className="font-bold bg-gradient-to-r from-indigo-600 to-primary-600 rounded-xl px-6">
            <Link href="/teacher/new">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Create First Mission</span>
            </Link>
          </Button>
        </Card>
      ) : (
        <StaggerContainer className="space-y-3.5">
          {missions.map((m) => {
            const relativeDue = getRelativeTimeString(m.dueAt);
            const isOverdue = relativeDue.includes("Overdue");
            const subj = subjectBadges[m.subject] || subjectBadges.math;
            const SubjIcon = subj.icon;

            return (
              <StaggerItem key={m.id}>
                <HoverSpring scale={1.01} y={-2}>
                  <div
                    className="rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${subj.className}`}>
                          <SubjIcon className="h-3.5 w-3.5" />
                          <span>{subj.label}</span>
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-xs font-bold text-neutral-500">
                          Grade {m.grade} ({m.curriculum})
                        </span>
                        <span className="text-neutral-300">•</span>
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isOverdue ? "text-rose-600 font-black" : "text-neutral-500"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{relativeDue || `Due ${formatDateTime(m.dueAt)}`}</span>
                        </span>
                        <Badge
                          variant={
                            m.status === "published"
                              ? "success"
                              : m.status === "closed"
                              ? "default"
                              : "warning"
                          }
                          className="capitalize text-2xs px-2.5 py-0.5 font-bold"
                        >
                          {m.status}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-black text-navy-900 truncate">
                        {m.title}
                      </h3>

                      {m.instructions && (
                        <p className="text-xs text-neutral-500 line-clamp-1">
                          {m.instructions}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      {m.status === "draft" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePublish(m.id)}
                            className="gap-1.5 text-xs font-bold rounded-xl text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Publish</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(m.id)}
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Delete draft"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}

                      {m.status === "published" && (
                        <>
                          <Button asChild variant="primary" size="sm" className="gap-1.5 text-xs font-bold rounded-xl">
                            <Link href={`/teacher/missions/${m.id}`}>
                              <BarChart2 className="h-3.5 w-3.5" />
                              <span>Analytics</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClose(m.id)}
                            className="text-xs text-neutral-500 hover:text-navy-900 rounded-xl"
                          >
                            Close
                          </Button>
                        </>
                      )}

                      {m.status === "closed" && (
                        <>
                          <Button asChild variant="secondary" size="sm" className="gap-1.5 text-xs font-bold rounded-xl">
                            <Link href={`/teacher/missions/${m.id}`}>
                              <FileText className="h-3.5 w-3.5 text-primary-600" />
                              <span>Final Results</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReopen(m.id)}
                            className="text-xs text-neutral-500 hover:text-navy-900 rounded-xl"
                          >
                            Reopen
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </HoverSpring>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </div>
  );
}
