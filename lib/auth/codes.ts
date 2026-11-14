import crypto from "crypto";

// Crockford Base32 alphabet (excludes I, L, O, U to avoid ambiguity)
const CROCKFORD_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export type RoleLetter = "S" | "T" | "A" | "Y";

export const ROLE_TO_LETTER: Record<string, RoleLetter> = {
  student: "S",
  teacher: "T",
  school_admin: "A",
  system_admin: "Y",
};

export const LETTER_TO_ROLE: Record<RoleLetter, string> = {
  S: "student",
  T: "teacher",
  A: "school_admin",
  Y: "system_admin",
};

/**
 * Generates a role-coded access code in format: R-XXXX-XXXX-XX
 * ~50 bits of entropy using crypto.randomBytes
 */
export function generateAccessCode(role: "student" | "teacher" | "school_admin" | "system_admin"): {
  plainCode: string;
  normalizedCode: string;
  codeHmac: string;
  codeLast4: string;
} {
  const roleLetter = ROLE_TO_LETTER[role];
  if (!roleLetter) {
    throw new Error(`Invalid role for code generation: ${role}`);
  }

  // Generate 10 random Crockford Base32 characters
  const randomBytes = crypto.randomBytes(10);
  let randomChars = "";
  for (let i = 0; i < 10; i++) {
    const byte = randomBytes[i];
    randomChars += CROCKFORD_ALPHABET[byte % CROCKFORD_ALPHABET.length];
  }

  // Format: R-XXXX-XXXX-XX
  const plainCode = `${roleLetter}-${randomChars.slice(0, 4)}-${randomChars.slice(4, 8)}-${randomChars.slice(8, 10)}`;
  const normalizedCode = normalizeAccessCode(plainCode);
  const codeHmac = hashAccessCode(normalizedCode);
  const codeLast4 = normalizedCode.slice(-4);

  return {
    plainCode,
    normalizedCode,
    codeHmac,
    codeLast4,
  };
}

/**
 * Normalizes user input code:
 * - uppercase
 * - remove spaces and hyphens
 * - map O -> 0
 * - map I / L -> 1
 */
export function normalizeAccessCode(rawCode: string): string {
  if (!rawCode) return "";
  let clean = rawCode.trim().toUpperCase().replace(/[\s-]+/g, "");
  // Crockford error-correction mapping
  clean = clean.replace(/O/g, "0").replace(/[IL]/g, "1");
  return clean;
}

/**
 * Hashes normalized code using HMAC-SHA256 with server pepper
 */
export function hashAccessCode(normalizedCode: string, pepper = process.env.CODE_PEPPER || "default-dev-pepper"): string {
  return crypto.createHmac("sha256", pepper).update(normalizedCode).digest("hex");
}

/**
 * Hashes client IP using SHA256 for brute-force tracking
 */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip || "unknown-ip").digest("hex");
}
