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
    if (!confirm(`Delete class ${cls.name}? It must be empty.`)) return;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Class Sections</h1>
          <p className="text-sm text-neutral-600">
            Organize grade sections, view enrolled students, and assign teachers
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Class</span>
        </Button>
      </div>

      {/* Grid of classes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-neutral-200/50 rounded-lg animate-pulse" />
          <div className="h-32 bg-neutral-200/50 rounded-lg animate-pulse" />
          <div className="h-32 bg-neutral-200/50 rounded-lg animate-pulse" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy-900">No classes configured</h3>
          <p className="text-sm text-neutral-600 mb-4 max-w-sm mx-auto">
            Classes are created automatically during spreadsheet import or can be added manually here.
          </p>
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Class
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-navy-900">{cls.name}</CardTitle>
                    <CardDescription>
                      Grade {cls.grade} • <span className="capitalize">{cls.curriculum}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="primary">
                    Year {cls.academicYear}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenStudents(cls)}
                  className="gap-1.5 text-xs"
                >
                  <Users className="h-3.5 w-3.5 text-primary-600" />
                  <span>View Students</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClass(cls)}
                  className="text-neutral-400 hover:text-semantic-danger text-xs p-1"
                  title="Delete empty class"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Create Class */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Class Section</DialogTitle>
            <DialogDescription>
              Add a new class group for the current academic year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <Input
              label="Class Name"
              placeholder="e.g. 6A, 7B, 8C"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 text-start">
                <label className="text-sm font-medium text-neutral-900">Grade</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="6">Grade 6</option>
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                </select>
              </div>

              <div className="space-y-1.5 text-start">
                <label className="text-sm font-medium text-neutral-900">Curriculum</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-surface text-sm text-neutral-900"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as any)}
                >
                  <option value="american">American</option>
                  <option value="cambridge">Cambridge</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={creating}>
                Create Class
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: View Enrolled Students */}
      <Dialog open={viewStudentsOpen} onOpenChange={setViewStudentsOpen}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Students in {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Grade {selectedClass?.grade} ({selectedClass?.curriculum})
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {loadingStudents ? (
              <p className="text-xs text-neutral-600 text-center py-4">Loading roster...</p>
            ) : enrolledStudents.length === 0 ? (
              <p className="text-xs text-neutral-600 text-center py-4">No students currently enrolled in this class.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {enrolledStudents.map((s) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{s.fullName}</p>
                      {s.externalId && <p className="text-xs text-neutral-600 font-mono">ID: {s.externalId}</p>}
                    </div>
                    <span className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                      ••••-{s.codeLast4}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setViewStudentsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
