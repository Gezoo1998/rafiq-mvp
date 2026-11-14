import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { getUsers, createUser } from "@/lib/db/queries/users";
import { generateAccessCode } from "@/lib/auth/codes";
import { logAudit } from "@/lib/db/queries/system";

const createUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["student", "teacher"]),
  externalId: z.string().optional().nullable(),
  grade: z.number().int().min(6).max(8).optional().nullable(),
  curriculum: z.enum(["american", "cambridge"]).optional().nullable(),
  preferredLanguage: z.enum(["en", "ar", "mixed"]).optional().nullable(),
  classIds: z.array(z.string()).optional(),
  subjects: z.array(z.enum(["math", "science", "english"])).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const { searchParams } = new URL(req.url);

    const role = (searchParams.get("role") as any) || undefined;
    const classId = searchParams.get("classId") || undefined;
    const search = searchParams.get("q") || undefined;
    const status = searchParams.get("status") || undefined;

    const usersList = await getUsers(actor, {
      role,
      classId,
      search,
      status,
    });

    return NextResponse.json({ users: usersList });
  } catch (err: any) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ error: { message: err.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRole(["school_admin", "system_admin"]);
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Validation error", fields: parsed.error.flatten().fieldErrors } },
        { status: 400 }
      );
    }

    const { role } = parsed.data;
    const codeData = generateAccessCode(role);

    const newUser = await createUser(actor, {
      ...parsed.data,
      codeHmac: codeData.codeHmac,
      codeLast4: codeData.codeLast4,
    });

    await logAudit({
      schoolId: actor.schoolId,
      actorId: actor.userId,
      action: "create_user",
      entityType: "user",
      entityId: newUser.id,
      meta: { name: newUser.fullName, role: newUser.role },
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
