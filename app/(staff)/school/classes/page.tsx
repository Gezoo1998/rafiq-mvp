"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Layers,
  Plus,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
} from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  grade: number;
  curriculum: "american" | "cambridge";
  academicYear: string;
}

interface StudentInClass {
  id: string;
  fullName: string;
  externalId: string | null;
  codeLast4: string;
}

export default function SchoolClassesPage() {
  const [classes, setClasses] = React.useState<ClassItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Create class dialog
  const [createOpen, setCreateOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [grade, setGrade] = React.useState("6");
  const [curriculum, setCurriculum] = React.useState<"american" | "cambridge">("american");
  const [creating, setCreating] = React.useState(false);

  // View enrolled students modal
  const [viewStudentsOpen, setViewStudentsOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassItem | null>(null);
  const [enrolledStudents, setEnrolledStudents] = React.useState<StudentInClass[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/school/classes");
      const data = await res.json();
      if (res.ok) setClasses(data.classes || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/school/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().toUpperCase(),
          grade: parseInt(grade, 10),
          curriculum,
        }),
      });

      if (res.ok) {
        setCreateOpen(false);
        setName("");
        fetchClasses();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleOpenStudents = async (cls: ClassItem) => {
    setSelectedClass(cls);
    setViewStudentsOpen(true);
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/school/classes/${cls.id}`);
      const data = await res.json();
      if (res.ok) {
        setEnrolledStudents(data.students || []);
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeleteClass = async (cls: ClassItem) => {
    if (!confirm(`Delete class ${cls.name}? It must be empty of enrolled students.`)) return;

    try {
      const res = await fetch(`/api/school/classes/${cls.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || "Failed to delete class");
      } else {
        fetchClasses();
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-indigo-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Class Sections
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-3">
            Configure school cohorts, curriculums, and view enrolled student rosters
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
            {classes.length} Class Section{classes.length === 1 ? "" : "s"}
          </Badge>
          <Button
            variant="primary"
            onClick={() => setCreateOpen(true)}
            className="gap-2 shrink-0 rounded-xl font-bold text-xs shadow-md shadow-primary-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Class</span>
          </Button>
        </div>
      </div>

      {/* Grid of classes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
          <div className="h-44 bg-neutral-200/60 rounded-3xl" />
          <div className="h-44 bg-neutral-200/60 rounded-3xl" />
          <div className="h-44 bg-neutral-200/60 rounded-3xl" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border border-neutral-200 shadow-sm bg-white p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">No classes configured</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            Classes are created automatically during spreadsheet roster import or can be added manually.
          </p>
          <Button variant="primary" onClick={() => setCreateOpen(true)} className="rounded-xl font-bold">
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Class
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls, idx) => {
            const accents = [
              "from-indigo-500 to-primary-600",
              "from-emerald-500 to-teal-600",
              "from-amber-500 to-orange-600",
              "from-rose-500 to-pink-600",
            ];
            const accent = accents[idx % accents.length];

            return (
              <Card
                key={cls.id}
                className="rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden bg-white hover:border-primary-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-2 w-full bg-gradient-to-r ${accent}`} />
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-extrabold text-navy-900 tracking-tight">
                          {cls.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                          <span>Grade {cls.grade}</span>
                          <span>•</span>
                          <span className="capitalize">{cls.curriculum}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-2xs font-semibold px-2.5 py-0.5 uppercase tracking-wider">
                        Year {cls.academicYear}
                      </Badge>
                    </div>
                  </CardHeader>
                </div>

                <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenStudents(cls)}
                    className="gap-1.5 text-xs rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 font-bold"
                  >
                    <Users className="h-3.5 w-3.5 text-primary-600" />
                    <span>View Roster</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(cls)}
                    className="text-neutral-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg"
                    title="Delete empty class"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog: Create Class */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-900">Create Class Section</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Add a new class group and assign curriculum standards.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-3">
            <Input
              label="Class Code / Name"
              placeholder="e.g. 6A, 7B, 8C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-10 text-xs uppercase"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 text-start">
                <label className="text-xs font-bold text-navy-900">Grade Level</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                </select>
              </div>

              <div className="space-y-1 text-start">
                <label className="text-xs font-bold text-navy-900">Curriculum</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-neutral-300 bg-white text-xs font-semibold text-navy-900 focus:outline-none focus:border-primary-500"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as any)}
                >
                  <option value="american">American</option>
                  <option value="cambridge">Cambridge</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creating} className="rounded-xl text-xs font-bold">
                Create Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: View Enrolled Students */}
      <Dialog open={viewStudentsOpen} onOpenChange={setViewStudentsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <span>Roster: {selectedClass?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Grade {selectedClass?.grade} • {selectedClass?.curriculum} Standards
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {loadingStudents ? (
              <p className="text-xs text-neutral-500 text-center py-6">Loading enrolled students...</p>
            ) : enrolledStudents.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-xs font-bold text-navy-900">No students enrolled yet</p>
                <p className="text-2xs text-neutral-400">Use spreadsheet import to assign students to this section.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {enrolledStudents.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-navy-900">{s.fullName}</p>
                      {s.externalId && <p className="text-2xs text-neutral-400 font-mono">ID: {s.externalId}</p>}
                    </div>
                    <span className="text-2xs font-mono font-bold bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-200">
                      ••••-{s.codeLast4}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="secondary" onClick={() => setViewStudentsOpen(false)} className="rounded-xl text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
