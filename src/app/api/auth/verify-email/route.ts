import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { emailVerificationRateLimiter, getClientIP } from "@/lib/rate-limit";

/**
 * GET /api/auth/verify-email?token=xxx
 * 
 * Verify user email with token
 * - Validates token
 * - Checks if token is expired
 * - Updates user emailVerified field
 * - Deletes verification token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=missing_token", request.url)
      );
    }

    // Validate token format
    const validationResult = verifyEmailSchema.safeParse({ token });

    if (!validationResult.success) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", request.url)
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/login?error=token_not_found", request.url)
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });

      return NextResponse.redirect(
        new URL("/login?error=token_expired", request.url)
      );
    }

    // Update user emailVerified
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete verification token (one-time use)
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/login?verified=true", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }
}

/**
 * POST /api/auth/verify-email/resend
 * 
 * Resend verification email
 * - Rate limited: 3 requests per hour per email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      );
    }

    // Rate limiting by email
    const rateLimitResult = await emailVerificationRateLimiter.limit(email.toLowerCase());

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset);
      const minutesLeft = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 1000));
      
      return NextResponse.json(
        {
          error: `Trop de demandes. Veuillez réessayer dans ${minutesLeft} minute(s).`,
          rateLimited: true,
          resetAt: resetTime.toISOString(),
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return NextResponse.json(
        {
          success: true,
          message: "Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.",
        },
        { status: 200 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          error: "Cet email est déjà vérifié.",
        },
        { status: 400 }
      );
    }

    // Delete old verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Generate new verification token
    const { randomBytes } = await import("crypto");
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires: verificationTokenExpiry,
      },
    });

    // Send verification email (if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${verificationToken}`;
        
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "noreply@photonsolar.be",
          to: email,
          subject: "Vérifiez votre adresse email - Photon Solar",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vérification de votre email</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #E67E22; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0;">Photon Solar</h1>
                </div>
                <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                  <h2 style="color: #E67E22; margin-top: 0;">Vérification de votre email</h2>
                  <p>Bonjour ${user.name || "Utilisateur"},</p>
                  <p>Vous avez demandé un nouveau lien de vérification. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #E67E22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Vérifier mon email</a>
                  </div>
                  <p style="font-size: 14px; color: #666;">Ou copiez-collez ce lien dans votre navigateur :</p>
                  <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">Ce lien expirera dans 24 heures.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                  <p>© ${new Date().getFullYear()} Photon Solar. Tous droits réservés.</p>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        return NextResponse.json(
          {
            error: "Erreur lors de l'envoi de l'email. Veuillez réessayer plus tard.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Un nouveau lien de vérification a été envoyé à votre adresse email.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

