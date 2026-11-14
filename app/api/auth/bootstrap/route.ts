import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAccessCode } from "@/lib/auth/codes";
import { logAudit } from "@/lib/db/queries/system";

const bootstrapSchema = z.object({
  bootstrapCode: z.string().min(1, "Bootstrap code required"),
  fullName: z.string().min(2, "Full name required").default("System Administrator"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bootstrapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid payload" } }, { status: 400 });
    }

    const expectedBootstrap = process.env.SYSTEM_ADMIN_BOOTSTRAP_CODE;
    if (!expectedBootstrap || parsed.data.bootstrapCode !== expectedBootstrap) {
      return NextResponse.json(
        { error: { message: "Invalid bootstrap authorization code" } },
        { status: 401 }
      );
    }

    // Check if any system_admin already exists
    const existingSysAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "system_admin"))
      .limit(1);

    if (existingSysAdmin.length > 0) {
      return NextResponse.json(
        { error: { message: "System administrator bootstrap has already been performed." } },
        { status: 409 }
      );
    }

    // Generate code for system admin
    const codeData = generateAccessCode("system_admin");

    const inserted = await db
      .insert(users)
      .values({
        schoolId: null,
        role: "system_admin",
        fullName: parsed.data.fullName,
        codeHmac: codeData.codeHmac,
        codeLast4: codeData.codeLast4,
        status: "active",
      })
      .returning();

    await logAudit({
      actorId: inserted[0].id,
      action: "bootstrap_system_admin",
      entityType: "user",
      entityId: inserted[0].id,
    });

    return NextResponse.json({
      message: "System Admin created successfully. Save this access code securely; it cannot be shown again.",
      user: {
        id: inserted[0].id,
        fullName: inserted[0].fullName,
        role: inserted[0].role,
      },
      code: codeData.plainCode,
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
  }
}

