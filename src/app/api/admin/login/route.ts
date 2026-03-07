import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSessionToken, buildAdminSessionCookie } from "@/lib/admin-auth-server";

export async function POST(request: NextRequest) {
  let password = "";
  try {
    const body = await request.json().catch(() => ({}));
    password = typeof body?.password === "string" ? body.password.trim() : "";

    if (!password) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }

    let remainingAttempts = 5;
    try {
      const { adminLoginRateLimiter, getClientIP } = await import("@/lib/rate-limit");
      const clientIP = getClientIP(request);
      const rateLimitResult = await adminLoginRateLimiter.limit(clientIP);
      remainingAttempts = rateLimitResult.remaining;
      if (!rateLimitResult.success) {
        const resetTime = new Date(rateLimitResult.reset);
        return NextResponse.json(
          {
            error: `Trop de tentatives. Réessayez après ${resetTime.toLocaleTimeString("fr-BE")}.`,
            rateLimited: true,
            resetAt: rateLimitResult.reset,
          },
          { status: 429 }
        );
      }
    } catch (rateLimitError) {
      console.warn("Admin login: rate limiter unavailable, allowing request", rateLimitError);
    }

    if (await verifyPassword(password)) {
      const token = createAdminSessionToken();
      const cookie = buildAdminSessionCookie(token);

      return NextResponse.json(
        { success: true, remainingAttempts },
        {
          headers: {
            "Set-Cookie": cookie,
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Mot de passe incorrect", remainingAttempts },
      { status: 401 }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Admin login error:", err.message, err.stack);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
