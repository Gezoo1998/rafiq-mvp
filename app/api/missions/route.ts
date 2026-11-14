import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getMissions, createMission } from "@/lib/db/queries/missions";
import { logAudit } from "@/lib/db/queries/system";

const createMissionSchema = z.object({
  title: z.string().min(2, "Title is required").max(120, "Title must be 120 chars or less"),
  instructions: z.string().max(2000, "Instructions must be 2000 chars or less").optional().nullable(),
  subject: z.enum(["math", "science", "english"]),
  grade: z.number().int().min(6).max(8),
  curriculum: z.enum(["american", "cambridge"]),
  languageMode: z.enum(["en", "ar", "mixed"]),
  dueAt: z.string().transform((str) => new Date(str)),
  targets: z.array(
    z.object({
      classId: z.string().uuid().optional(),
      studentId: z.string().uuid().optional(),
    })
  ).min(1, "Select at least one class or student target"),
});

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole(["teacher", "school_admin", "system_admin"]);
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") as any) || undefined;
    const subject = (searchParams.get("subject") as any) || undefined;

    const list = await getMissions(actor, { status, subject });
    return NextResponse.json({ missions: list });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["teacher", "school_admin"]);
    const body = await req.json();
    const parsed = createMissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Validation error", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const mission = await createMission(actor, parsed.data);

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "create_mission",
      entityType: "mission",
      entityId: mission.id,
      meta: { title: mission.title },
    });

    return NextResponse.json({ mission }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
