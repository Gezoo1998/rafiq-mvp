import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { db } from "@/lib/db/client";
import { importBatches } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { commitImportBatch } from "@/lib/import/commit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { batchId } = await params;

    const batches = await db
      .select()
      .from(importBatches)
      .where(and(eq(importBatches.id, batchId), eq(importBatches.schoolId, actor.schoolId!)))
      .limit(1);

    if (!batches[0]) {
      return NextResponse.json({ error: { message: "Import batch not found" } }, { status: 404 });
    }

    if (batches[0].status === "committed") {
      return NextResponse.json(
        { error: { message: "This import batch has already been committed." } },
        { status: 409 }
      );
    }

    const payload = batches[0].payload as any;
    const result = await commitImportBatch(actor, batchId, payload);

    return NextResponse.json({
      message: "Import committed successfully",
      createdStudents: result.createdStudents,
      createdTeachers: result.createdTeachers,
      createdClasses: result.createdClasses,
      credentials: result.credentials,
    });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

