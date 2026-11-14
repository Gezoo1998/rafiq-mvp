import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "rafiq_session";

export interface SessionPayload {
  sub: string; // userId
  role: "student" | "teacher" | "school_admin" | "system_admin";
  schoolId: string | null;
  name: string;
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "default-dev-session-secret-change-in-prod-32bytes";
  return new TextEncoder().encode(secret);
}

/**
 * Creates and signs a JWT for the session
 * Student lifetime: 12h, Staff lifetime: 8h
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  const expiration = payload.role === "student" ? "12h" : "8h";

  return await new SignJWT({
    role: payload.role,
    schoolId: payload.schoolId,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
}

/**
 * Verifies a JWT token and returns payload or null
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || !payload.role) return null;

    return {
      sub: payload.sub,
      role: payload.role as SessionPayload["role"],
      schoolId: (payload.schoolId as string) || null,
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

/**
 * Sets session cookie on Next.js Response / cookies()
 */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  const maxAge = payload.role === "student" ? 12 * 60 * 60 : 8 * 60 * 60;

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/**
 * Retrieves the current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return await verifySessionToken(cookie.value);
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
