import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getSchoolById } from "@/lib/db/queries/schools";
import { createUser } from "@/lib/db/queries/users";
import { generateAccessCode } from "@/lib/auth/codes";
import { logAudit } from "@/lib/db/queries/system";

const createAdminSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  externalId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireRole(["system_admin"]);
    const { id: schoolId } = await params;

    const school = await getSchoolById(actor, schoolId);
    if (!school) {
      return NextResponse.json({ error: { message: "School not found" } }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Validation error" } }, { status: 400 });
    }

    const codeData = generateAccessCode("school_admin");

    const newUser = await createUser(actor, {
      schoolId,
      role: "school_admin",
      fullName: parsed.data.fullName,
      externalId: parsed.data.externalId || null,
      codeHmac: codeData.codeHmac,
      codeLast4: codeData.codeLast4,
    });

    await logAudit({
      schoolId,
      actorId: actor.userId,
      action: "create_school_admin",
      entityType: "user",
      entityId: newUser.id,
      meta: { name: newUser.fullName },
    });

    return NextResponse.json(
      {
        user: newUser,
        code: codeData.plainCode,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

