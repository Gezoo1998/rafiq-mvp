import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./session";

export type Role = "student" | "teacher" | "school_admin" | "system_admin";

export interface Actor {
  userId: string;
  role: Role;
  schoolId: string | null;
  name: string;
}

/**
 * Validates Same-Origin header for mutating requests (Section 9)
 */
export async function verifySameOrigin(request: Request): Promise<boolean> {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");

  if (!origin || !host) {
    // In dev or some server-to-server calls origin might be absent, but in browsers it is present
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Ensures user is authenticated and has one of the allowed roles.
 * Returns the Actor object or throws a Next.js response.
 */
export async function requireRole(allowedRoles: Role[]): Promise<Actor> {
  const session = await getSession();

  if (!session) {
    throw new NextResponse(
      JSON.stringify({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!allowedRoles.includes(session.role)) {
    throw new NextResponse(
      JSON.stringify({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return {
    userId: session.sub,
    role: session.role,
    schoolId: session.schoolId,
    name: session.name,
  };
}
