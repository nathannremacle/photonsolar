import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSessionToken, buildAdminSessionCookie } from "@/lib/admin-auth";
import { adminLoginRateLimiter, getClientIP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const rateLimitResult = await adminLoginRateLimiter.limit(clientIP);

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

    if (verifyPassword(password)) {
      const token = createAdminSessionToken();
      const cookie = buildAdminSessionCookie(token);

      return NextResponse.json(
        { success: true, remainingAttempts: rateLimitResult.remaining },
        {
          headers: {
            "Set-Cookie": cookie,
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Mot de passe incorrect", remainingAttempts: rateLimitResult.remaining },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
