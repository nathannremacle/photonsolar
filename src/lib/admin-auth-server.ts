import { createHmac, timingSafeEqual } from "crypto";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { compareSync, hashSync } from "bcryptjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "admin-fallback-secret";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours
const COOKIE_NAME = "admin_session";
const SETTINGS_FILE = join(process.cwd(), "data/admin-settings.json");

function getSecret(): string {
  if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
    console.warn("Admin: ADMIN_SESSION_SECRET or NEXTAUTH_SECRET should be at least 16 characters.");
  }
  return SESSION_SECRET;
}

function getPasswordFromSettingsFile(): string | null {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const raw = readFileSync(SETTINGS_FILE, "utf-8");
      const data = JSON.parse(raw) as { adminPassword?: string };
      if (data.adminPassword != null && typeof data.adminPassword === "string") {
        const trimmed = data.adminPassword.trim();
        if (trimmed) return trimmed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function getAdminPasswordHashFromDb(): Promise<string | null> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.adminSettings.findUnique({ where: { id: "admin" } });
    if (row?.adminPasswordHash?.trim()) return row.adminPasswordHash.trim();
  } catch (e) {
    // ignore: table missing, DB unreachable, or Prisma client without AdminSettings
  }
  return null;
}

const DEFAULT_ADMIN_PASSWORD = "Opusweb";

function safeBcryptCompare(input: string, hash: string): boolean {
  try {
    return compareSync(input, hash);
  } catch {
    return false;
  }
}

/** Verify admin password. Order: ADMIN_PASSWORD_HASH (env) > ADMIN_PASSWORD (env) > DB hash > file > "Opusweb". Never throws. */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const input = typeof password === "string" ? password.trim() : "";
    if (!input) return false;
    if (ADMIN_PASSWORD_HASH?.trim()) {
      return safeBcryptCompare(input, ADMIN_PASSWORD_HASH);
    }
    const fromEnv = ADMIN_PASSWORD && typeof ADMIN_PASSWORD === "string" ? ADMIN_PASSWORD.trim() : "";
    if (fromEnv) return input === fromEnv;
    const dbHash = await getAdminPasswordHashFromDb();
    if (dbHash) return safeBcryptCompare(input, dbHash);
    const fromFile = getPasswordFromSettingsFile();
    const pwd = fromFile || DEFAULT_ADMIN_PASSWORD;
    return input === pwd;
  } catch {
    return false;
  }
}

/** Generate a hash for ADMIN_PASSWORD_HASH. Run: node -e "require('bcryptjs').hash(process.argv[1], 10, (e,h)=>console.log(h))" YOUR_PASSWORD */
export function hashAdminPassword(password: string): string {
  return hashSync(password, 10);
}

/** Create a signed session token (server-only). */
export function createAdminSessionToken(): string {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${expiry}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

/** Verify signed session token (server-only). */
export function verifyAdminSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = decoded.split(".");
    if (!payload || !sig) return false;
    const expiry = parseInt(payload, 10);
    if (isNaN(expiry) || expiry < Date.now() / 1000) return false;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
    if (expected.length !== sig.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

/** Get admin session from request (cookie). Returns true if valid (server-only). */
export function getAdminSessionFromRequest(request: NextRequest): boolean {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  return verifyAdminSessionToken(cookie);
}

/** Build Set-Cookie header value for admin session (server-only). */
export function buildAdminSessionCookie(token: string, maxAge: number = SESSION_MAX_AGE): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

/** Use in API routes: const err = requireAdminSession(request); if (err) return err; */
export function requireAdminSession(request: NextRequest): NextResponse | null {
  if (getAdminSessionFromRequest(request)) return null;
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
