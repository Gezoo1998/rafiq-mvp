"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, BookOpen, ArrowRight, PlusCircle, GraduationCap } from "lucide-react";

export default function TeacherClassesPage() {
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/school/classes");
        const data = await res.json();
        if (res.ok) setClasses(data.classes || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary-500 to-primary-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              My Assigned Classes
            </h1>
          </div>
          <p className="text-sm text-neutral-500 ml-3">
            Cohorts, grade levels, and sections assigned to your teaching profile
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="primary" className="text-xs px-3 py-1 font-semibold">
            {classes.length} Active Class{classes.length === 1 ? "" : "es"}
          </Badge>
          <Button asChild variant="primary" size="sm" className="gap-2 rounded-xl text-xs font-bold shadow-md shadow-primary-500/20">
            <Link href="/teacher/new">
              <PlusCircle className="h-4 w-4" />
              <span>New Mission</span>
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          <div className="h-48 bg-neutral-200/60 rounded-3xl" />
          <div className="h-48 bg-neutral-200/60 rounded-3xl" />
          <div className="h-48 bg-neutral-200/60 rounded-3xl" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-16 rounded-3xl border border-neutral-200 shadow-sm bg-white p-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <Layers className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">No classes assigned yet</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
            Your school administrator assigns classes and subjects to your profile. Check back once your roster is populated.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls, idx) => {
            const accents = [
              "from-indigo-500 to-primary-600",
              "from-emerald-500 to-teal-600",
              "from-rose-500 to-pink-600",
              "from-amber-500 to-orange-600",
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
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl font-extrabold text-navy-900 tracking-tight">
                          {cls.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                          <span>Grade {cls.grade}</span>
                          <span>•</span>
                          <span className="capitalize">{cls.curriculum} Standards</span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-2xs font-semibold px-2 py-0.5 uppercase tracking-wider">
                        Year {cls.academicYear}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-1 pb-4">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">Status</span>
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active Enrolled
                      </span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-xs text-neutral-600 hover:text-navy-900">
                    <Link href="/teacher">View Missions</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className="text-xs gap-1.5 rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 font-bold">
                    <Link href="/teacher/new">
                      <BookOpen className="h-3.5 w-3.5 text-primary-600" />
                      <span>Assign Mission</span>
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
