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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Missions</h1>
          <p className="text-sm text-neutral-600">
            Create interactive learning missions, assign target classes, and view student progress
          </p>
        </div>
        <Button asChild variant="primary" className="gap-2 shrink-0">
          <Link href="/teacher/new">
            <Plus className="h-4 w-4" />
            <span>New Mission</span>
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 text-xs">
        {["all", "published", "draft", "closed"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-colors ${
              filterStatus === st
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Missions List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-28 bg-neutral-200/50 rounded-lg" />
          <div className="h-28 bg-neutral-200/50 rounded-lg" />
        </div>
      ) : missions.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy-900">No missions found</h3>
          <p className="text-sm text-neutral-600 mb-4 max-w-sm mx-auto">
            Get started by creating a 60-second interactive mission for your students.
          </p>
          <Button asChild variant="primary">
            <Link href="/teacher/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Mission
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const relativeDue = getRelativeTimeString(m.dueAt);
            const isOverdue = relativeDue.includes("Overdue");

            return (
              <Card key={m.id} className="hover:border-primary-300 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" className="uppercase font-bold text-2xs">
                        {m.subject}
                      </Badge>
                      <span className="text-xs text-neutral-600">
                        Grade {m.grade} ({m.curriculum})
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs text-neutral-600 uppercase">
                        Mode: {m.languageMode}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isOverdue && m.status === "published"
                            ? "text-semantic-danger font-bold"
                            : "text-neutral-600"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>Due {formatDateTime(m.dueAt)}</span>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 truncate">{m.title}</h3>

                    {m.instructions && (
                      <p className="text-xs text-neutral-600 line-clamp-1">{m.instructions}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        m.status === "published"
                          ? "success"
                          : m.status === "closed"
                          ? "default"
                          : "warning"
                      }
                      className="capitalize"
                    >
                      {m.status}
                    </Badge>

                    {m.status === "published" && (
                      <>
                        <Button asChild variant="primary" size="sm" className="gap-1.5">
                          <Link href={`/teacher/missions/${m.id}`}>
                            <BarChart2 className="h-3.5 w-3.5" />
                            <span>Results</span>
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleClose(m.id)}
                          className="text-xs"
                        >
                          Close
                        </Button>
                      </>
                    )}

                    {m.status === "closed" && (
                      <>
                        <Button asChild variant="primary" size="sm" className="gap-1.5">
                          <Link href={`/teacher/missions/${m.id}`}>
                            <BarChart2 className="h-3.5 w-3.5" />
                            <span>Results</span>
                          </Link>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReopen(m.id)}
                          className="text-xs"
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
                          className="gap-1.5 text-xs font-semibold"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Publish</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(m.id)}
                          className="text-neutral-400 hover:text-semantic-danger p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

