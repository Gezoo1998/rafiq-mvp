"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Users,
  Layers,
  Save,
} from "lucide-react";

interface ClassOption {
  id: string;
  name: string;
  grade: number;
  curriculum: string;
}

export default function NewMissionPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [subject, setSubject] = React.useState<"math" | "science" | "english">("math");
  const [grade, setGrade] = React.useState("6");
  const [curriculum, setCurriculum] = React.useState<"american" | "cambridge">("american");
  const [languageMode, setLanguageMode] = React.useState<"en" | "ar" | "mixed">("mixed");

  // Due date: default 3 days from now at 23:59
  const defaultDueDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  }, []);

  const [dueAt, setDueAt] = React.useState(defaultDueDate);

  // Available classes
  const [availableClasses, setAvailableClasses] = React.useState<ClassOption[]>([]);
  const [selectedClassIds, setSelectedClassIds] = React.useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadClasses() {
      try {
        setLoadingClasses(true);
        const res = await fetch("/api/school/classes");
        const data = await res.json();
        if (res.ok) {
          setAvailableClasses(data.classes || []);
        }
      } finally {
        setLoadingClasses(false);
      }
    }
    loadClasses();
  }, []);

  // Filter classes matching current grade & curriculum
  const filteredClasses = availableClasses.filter(
    (c) => c.grade === parseInt(grade, 10) && c.curriculum === curriculum
  );

  const toggleClassSelect = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleCreate = async (publishImmediately: boolean) => {
    if (!title.trim()) {
      setErrorMsg("Mission title is required");
      return;
    }

    if (selectedClassIds.length === 0) {
      setErrorMsg("Please select at least one target class");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      // 1. Create draft mission
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim() || null,
          subject,
          grade: parseInt(grade, 10),
          curriculum,
          languageMode,
          dueAt: new Date(dueAt).toISOString(),
          targets: selectedClassIds.map((cid) => ({ classId: cid })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error?.message || "Failed to create mission");
        setSubmitting(false);
        return;
      }

      const createdMission = data.mission;

      // 2. If publishing immediately, call publish endpoint
      if (publishImmediately) {
        const pubRes = await fetch(`/api/missions/${createdMission.id}/publish`, {
          method: "POST",
        });
        if (!pubRes.ok) {
          setErrorMsg("Mission created, but failed to publish assignments");
          setSubmitting(false);
          return;
        }
      }

      router.push("/teacher");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link href="/teacher">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Create New Mission</h1>
          <p className="text-sm text-neutral-600">
            Define learning topic, instructions, and target student sections
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-semantic-danger rounded-lg border border-red-200 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Mission Details */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-navy-900">
                Mission Title <span className="text-semantic-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Adding Fractions with Unlike Denominators"
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-neutral-300 bg-surface text-base text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600"
              />
              <div className="flex justify-between text-2xs text-neutral-500">
                <span>Keep it concise and clear for middle-school students</span>
                <span>{title.length}/120</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-navy-900">
                Teacher Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on finding common multiples. Ask students to simplify their final answers."
                maxLength={2000}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full p-3 rounded-lg border border-neutral-300 bg-surface text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 resize-none"
              />
              <p className="text-2xs text-neutral-500">
                Guides the AI tutor on key vocabulary, steps to emphasize, or specific problem types.
              </p>
            </div>

            {/* Subject, Grade, Curriculum row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 text-start">
                <label className="text-sm font-semibold text-navy-900">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900 font-medium"
                >
                  <option value="math">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div className="space-y-1.5 text-start">
                <label className="text-sm font-semibold text-navy-900">Grade Level</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value);
                    setSelectedClassIds([]); // Reset selected targets on grade change
                  }}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900 font-medium"
                >
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                </select>
              </div>

              <div className="space-y-1.5 text-start">
                <label className="text-sm font-semibold text-navy-900">Curriculum</label>
                <select
                  value={curriculum}
                  onChange={(e) => {
                    setCurriculum(e.target.value as any);
                    setSelectedClassIds([]);
                  }}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900 font-medium"
                >
                  <option value="american">American</option>
                  <option value="cambridge">Cambridge</option>
                </select>
              </div>
            </div>

            {/* Language Mode & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-start">
                <label className="text-sm font-semibold text-navy-900">Tutoring Language</label>
                <select
                  value={languageMode}
                  onChange={(e) => setLanguageMode(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900"
                >
                  <option value="mixed">Mixed (Arabic explanation + English terms)</option>
                  <option value="en">English only</option>
                  <option value="ar">Arabic only</option>
                </select>
              </div>

              <div className="space-y-1.5 text-start">
                <label className="text-sm font-semibold text-navy-900">Due Date & Time</label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-surface text-sm text-neutral-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Target Section Selection */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-navy-900 block">
                  Target Classes for Grade {grade} ({curriculum}) <span className="text-semantic-danger">*</span>
                </label>
                <p className="text-xs text-neutral-500">
                  Select which class sections will receive this assignment
                </p>
              </div>
              <Badge variant="primary" className="text-2xs">
                {selectedClassIds.length} Classes Selected
              </Badge>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                No classes registered for Grade {grade} ({curriculum}). Create class sections in the School Admin panel first.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClassSelect(cls.id)}
                      className={`p-3 rounded-lg border text-start transition-all ${
                        isSelected
                          ? "border-primary-600 bg-primary-50/80 text-primary-900 font-bold ring-1 ring-primary-500"
                          : "border-neutral-200 bg-surface text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{cls.name}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 text-primary-600" />}
                      </div>
                      <span className="text-2xs text-neutral-500 font-normal">
                        Grade {cls.grade} • {cls.curriculum}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-6 border-t border-neutral-200">
            <Button asChild variant="ghost">
              <Link href="/teacher">Cancel</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={submitting}
              onClick={() => handleCreate(false)}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>Save as Draft</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={submitting}
              onClick={() => handleCreate(true)}
              className="gap-2 font-semibold"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Publish Mission</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

