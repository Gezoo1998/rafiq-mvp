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
  BookOpen,
  FlaskConical,
  Calculator,
  Calendar,
  AlertTriangle,
  Globe,
  FileText,
  ChevronRight,
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
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-neutral-200/60">
            <Link href="/teacher">
              <ArrowLeft className="h-5 w-5 text-navy-900" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Create New Mission
            </h1>
            <p className="text-sm text-neutral-500">
              Configure curriculum targets, pedagogical guidelines, and student class cohorts
            </p>
          </div>
        </div>

        <Badge variant="primary" className="self-start sm:self-auto px-3 py-1 font-semibold text-xs">
          Interactive Socratic Mission
        </Badge>
      </div>

      {/* Visual Stepper / Progress Bar */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100/80 rounded-2xl border border-neutral-200/80">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-xs border border-neutral-200">
          <span className="h-6 w-6 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            1
          </span>
          <span className="text-xs font-bold text-navy-900 truncate">Curriculum & Details</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${selectedClassIds.length > 0 ? "bg-white shadow-xs border border-neutral-200" : "text-neutral-500"}`}>
          <span className={`h-6 w-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${selectedClassIds.length > 0 ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
            2
          </span>
          <span className="text-xs font-semibold truncate">Target Classes ({selectedClassIds.length})</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${title.trim() && selectedClassIds.length > 0 ? "bg-white shadow-xs border border-neutral-200" : "text-neutral-500"}`}>
          <span className={`h-6 w-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${title.trim() && selectedClassIds.length > 0 ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
            3
          </span>
          <span className="text-xs font-semibold truncate">Review & Launch</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: Subject Selection */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-navy-900 flex items-center justify-between">
          <span>1. Select Mission Subject</span>
          <span className="text-2xs font-normal text-neutral-500">Determines pedagogical prompt & Socratic style</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            type="button"
            onClick={() => setSubject("math")}
            className={`p-4 rounded-2xl border-2 text-start transition-all relative overflow-hidden ${
              subject === "math"
                ? "border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Calculator className="h-5 w-5" />
              </div>
              {subject === "math" && <CheckCircle className="h-5 w-5 text-indigo-600" />}
            </div>
            <div className="font-extrabold text-navy-900 text-sm">Mathematics</div>
            <div className="text-2xs text-neutral-500 mt-0.5">Algebra, Geometry, Fractions & Word Problems</div>
          </button>

          <button
            type="button"
            onClick={() => setSubject("science")}
            className={`p-4 rounded-2xl border-2 text-start transition-all relative overflow-hidden ${
              subject === "science"
                ? "border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FlaskConical className="h-5 w-5" />
              </div>
              {subject === "science" && <CheckCircle className="h-5 w-5 text-emerald-600" />}
            </div>
            <div className="font-extrabold text-navy-900 text-sm">Science & Physics</div>
            <div className="text-2xs text-neutral-500 mt-0.5">Biology, Forces, Chemistry & Earth Systems</div>
          </button>

          <button
            type="button"
            onClick={() => setSubject("english")}
            className={`p-4 rounded-2xl border-2 text-start transition-all relative overflow-hidden ${
              subject === "english"
                ? "border-rose-600 bg-rose-50/70 shadow-md ring-2 ring-rose-500/20"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              {subject === "english" && <CheckCircle className="h-5 w-5 text-rose-600" />}
            </div>
            <div className="font-extrabold text-navy-900 text-sm">English Language</div>
            <div className="text-2xs text-neutral-500 mt-0.5">Grammar, Vocabulary & Comprehension</div>
          </button>
        </div>
      </div>

      {/* Section 2: Core Details Card */}
      <Card className="rounded-3xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-neutral-50/60 border-b border-neutral-200/80 px-6 py-4">
          <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-600" />
            2. Mission Parameters & Objectives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Mission Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">
                Mission Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-2xs font-mono text-neutral-400">{title.length}/120</span>
            </div>
            <Input
              placeholder="e.g., Solving Multi-Step Algebraic Equations with Variables on Both Sides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="h-11 rounded-xl text-sm"
              required
            />
          </div>

          {/* Teacher Instructions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy-900">
                Pedagogical Instructions for AI Tutor (Optional)
              </label>
              <span className="text-2xs text-neutral-400">Guides Socratic questioning</span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g., Guide students with everyday real-world examples before introducing formal symbolic equations. If they confuse negative signs, ask them to model it on a temperature scale."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-xs text-navy-900 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Grade, Curriculum, Language, Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-900">Target Grade</label>
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setSelectedClassIds([]); // Reset classes if grade changes
                }}
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
              >
                <option value="6">Grade 6 (Intermediate 1)</option>
                <option value="7">Grade 7 (Intermediate 2)</option>
                <option value="8">Grade 8 (Intermediate 3)</option>
                <option value="9">Grade 9 (Secondary 1)</option>
                <option value="10">Grade 10 (Secondary 2)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-900">Curriculum Standards</label>
              <select
                value={curriculum}
                onChange={(e) => {
                  setCurriculum(e.target.value as any);
                  setSelectedClassIds([]);
                }}
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
              >
                <option value="american">American Curriculum</option>
                <option value="cambridge">Cambridge International</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-900">Language Mode</label>
              <select
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
              >
                <option value="mixed">Mixed (Arabic + English)</option>
                <option value="en">English Only</option>
                <option value="ar">Arabic Only (العربية)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-navy-900">Due Date</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Target Classes */}
      <Card className="rounded-3xl border border-neutral-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-neutral-50/60 border-b border-neutral-200/80 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-600" />
                3. Assign Target Class Cohorts
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500 mt-0.5">
                Filtered to Grade {grade} • {curriculum} curriculum
              </CardDescription>
            </div>
            <Badge variant="primary" className="text-xs font-bold px-3 py-1">
              {selectedClassIds.length} Classes Selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingClasses ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
              <div className="h-20 bg-neutral-200/60 rounded-xl" />
              <div className="h-20 bg-neutral-200/60 rounded-xl" />
              <div className="h-20 bg-neutral-200/60 rounded-xl" />
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">No matching classes found</span>
                There are currently no class sections registered for Grade {grade} ({curriculum}). Create class sections in the School Admin portal or switch the grade above.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredClasses.map((cls) => {
                const isSelected = selectedClassIds.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClassSelect(cls.id)}
                    className={`p-4 rounded-2xl border-2 text-start transition-all relative ${
                      isSelected
                        ? "border-primary-600 bg-primary-50/80 text-primary-900 font-bold ring-2 ring-primary-500/20 shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-extrabold text-navy-900">{cls.name}</span>
                      {isSelected ? (
                        <CheckCircle className="h-4 w-4 text-primary-600" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-neutral-300" />
                      )}
                    </div>
                    <span className="text-2xs text-neutral-500 font-medium block">
                      Grade {cls.grade} • {cls.curriculum}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Bar */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-neutral-200 shadow-lg flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4">
        <Button asChild variant="ghost" size="sm" className="text-neutral-500 hover:text-navy-900">
          <Link href="/teacher">Discard & Return</Link>
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            isLoading={submitting}
            onClick={() => handleCreate(false)}
            className="gap-2 text-xs font-semibold rounded-xl"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            isLoading={submitting}
            onClick={() => handleCreate(true)}
            className="gap-2 text-xs font-bold rounded-xl shadow-md shadow-primary-500/25 px-5"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Publish to Classes Now</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
