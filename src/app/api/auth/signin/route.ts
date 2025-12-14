import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { signInSchema } from "@/lib/validations/auth";
import { authRateLimiter, getClientIP } from "@/lib/rate-limit";

/**
 * POST /api/auth/signin
 * 
 * Sign in user with credentials
 * - Validates input with Zod
 * - Rate limited: 5 attempts per 15 minutes per IP
 * - Uses NextAuth signIn function
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await authRateLimiter.limit(clientIP);

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset);
      const minutesLeft = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 1000));
      
      return NextResponse.json(
        {
          error: `Trop de tentatives de connexion. Veuillez réessayer dans ${minutesLeft} minute(s).`,
          rateLimited: true,
          resetAt: resetTime.toISOString(),
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = signInSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Attempt to sign in using NextAuth
    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      // If sign in successful, reset rate limit
      if (result) {
        await authRateLimiter.reset(clientIP);
      }

      return NextResponse.json(
        {
          success: true,
          message: "Connexion réussie",
        },
        { status: 200 }
      );
    } catch (signInError: any) {
      // Handle sign in errors
      if (signInError.type === "CredentialsSignin") {
        return NextResponse.json(
          {
            error: "Email ou mot de passe incorrect.",
          },
          { status: 401 }
        );
      }

      throw signInError;
    }
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

