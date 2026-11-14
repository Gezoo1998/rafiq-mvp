import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { parseAndValidateWorkbook } from "@/lib/import/validate";
import { db } from "@/lib/db/client";
import { importBatches } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    if (!actor.schoolId) {
      return NextResponse.json({ error: { message: "School ID required" } }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: { message: "No file provided" } }, { status: 400 });
    }

    // 5 MB limit check (Section 10.3)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: { message: "File exceeds maximum size of 5 MB" } },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = await parseAndValidateWorkbook(buffer);

    // Save batch in database
    const batch = await db
      .insert(importBatches)
      .values({
        schoolId: actor.schoolId,
        createdBy: actor.userId,
        filename: file.name,
        status: "previewed",
        summary: validation.summary,
        payload: {
          students: validation.students,
          teachers: validation.teachers,
        },
      })
      .returning();

    return NextResponse.json({
      batchId: batch[0].id,
      summary: validation.summary,
      studentsPreview: validation.students.slice(0, 50),
      teachersPreview: validation.teachers.slice(0, 50),
      errors: validation.errors,
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

