import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeAccessCode, hashAccessCode, hashIp } from "@/lib/auth/codes";
import { setSessionCookie } from "@/lib/auth/session";
import { getUserByCodeHmac, updateLastLogin } from "@/lib/db/queries/users";
import { logAudit } from "@/lib/db/queries/system";
import { db } from "@/lib/db/client";
import { authAttempts } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

const loginSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const ipHash = hashIp(ip);

    // US-AUTH-03: Brute force check (10 failures in 10 minutes -> 15 min lock)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const failureRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(authAttempts)
      .where(
        and(
          eq(authAttempts.ipHash, ipHash),
          eq(authAttempts.success, false),
          gte(authAttempts.createdAt, tenMinutesAgo)
        )
      );

    const recentFailures = failureRes[0]?.count ?? 0;
    if (recentFailures >= 10) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many failed attempts. Please wait 15 minutes before trying again.",
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid login code format",
          },
        },
        { status: 400 }
      );
    }

    const normalized = normalizeAccessCode(parsed.data.code);
    const codeHmac = hashAccessCode(normalized);

    const userWithSchool = await getUserByCodeHmac(codeHmac);

    if (!userWithSchool || userWithSchool.user.status !== "active") {
      // Record failed attempt
      await db.insert(authAttempts).values({
        ipHash,
        success: false,
      });

      return NextResponse.json(
        {
          error: {
            code: "INVALID_CODE",
            message: "That code doesn't look right. Check it and try again.",
          },
        },
        { status: 401 }
      );
    }

    const { user, school } = userWithSchool;

    // Check if school is active (for non-system admins)
    if (user.role !== "system_admin" && school && !school.isActive) {
      return NextResponse.json(
        {
          error: {
            code: "SCHOOL_INACTIVE",
            message: "Your school account is currently deactivated. Please contact your administrator.",
          },
        },
        { status: 403 }
      );
    }

    // Record successful attempt
    await db.insert(authAttempts).values({
      ipHash,
      success: true,
    });

    await updateLastLogin(user.id);

    // Set JWT session cookie
    await setSessionCookie({
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId,
      name: user.fullName,
    });

    await logAudit({
      schoolId: user.schoolId,
      actorId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
      meta: { role: user.role },
    });

    let redirectTo = "/missions";
    if (user.role === "teacher") redirectTo = "/teacher";
    else if (user.role === "school_admin") redirectTo = "/school";
    else if (user.role === "system_admin") redirectTo = "/system";

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        schoolId: user.schoolId,
        schoolName: school?.name || null,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}

