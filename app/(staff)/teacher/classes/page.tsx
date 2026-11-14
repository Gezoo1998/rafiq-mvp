"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Users, BookOpen, ArrowRight } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Classes</h1>
        <p className="text-sm text-neutral-600">
          Classes assigned to you for teaching and assigning missions
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          <div className="h-28 bg-neutral-200/50 rounded-lg" />
          <div className="h-28 bg-neutral-200/50 rounded-lg" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy-900">No classes assigned yet</h3>
          <p className="text-sm text-neutral-600 mb-4 max-w-sm mx-auto">
            Your school administrator assigns classes and subjects to your profile.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{cls.name}</CardTitle>
                  <Badge variant="primary">Year {cls.academicYear}</Badge>
                </div>
                <CardDescription>
                  Grade {cls.grade} • <span className="capitalize">{cls.curriculum}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <Button asChild variant="secondary" size="sm" className="text-xs gap-1.5">
                  <Link href="/teacher/new">
                    <BookOpen className="h-3.5 w-3.5 text-primary-600" />
                    <span>Assign Mission</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
