import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getSchools, createSchool } from "@/lib/db/queries/schools";
import { logAudit } from "@/lib/db/queries/system";

const createSchoolSchema = z.object({
  name: z.string().min(2, "School name is required"),
  city: z.string().min(2, "City is required"),
  defaultLanguageMode: z.enum(["en", "ar", "mixed"]).default("mixed"),
  aiDailyTokenCap: z.number().int().positive().default(2000000),
});

export async function GET() {
  try {
    const actor = await requireRole(["system_admin"]);
    const list = await getSchools(actor);
    return NextResponse.json({ schools: list });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["system_admin"]);
    const body = await req.json();
    const parsed = createSchoolSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Validation error", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const school = await createSchool(actor, parsed.data);

    await logAudit({
      schoolId: school.id,
      actorId: actor.userId,
      action: "create_school",
      entityType: "school",
      entityId: school.id,
      meta: { name: school.name },
    });

    return NextResponse.json({ school }, { status: 201 });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}
