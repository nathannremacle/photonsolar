import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordRequestSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { passwordResetRateLimiter, getClientIP } from "@/lib/rate-limit";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/reset-password/request
 * 
 * Request password reset
 * - Validates email
 * - Generates reset token
 * - Sends reset email
 * - Rate limited: 3 requests per hour per email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token, password, confirmPassword } = body;

    // Handle password reset request
    if (action === "request") {
      // Rate limiting by email
      const rateLimitResult = await passwordResetRateLimiter.limit(email?.toLowerCase() || "");

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

      // Validate email
      const validationResult = resetPasswordRequestSchema.safeParse({ email });

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Email invalide",
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }

      const validatedEmail = validationResult.data.email.toLowerCase();

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: validatedEmail },
      });

      // Don't reveal if user exists (security best practice)
      // Always return success message
      if (!user) {
        return NextResponse.json(
          {
            success: true,
            message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
          },
          { status: 200 }
        );
      }

      // Delete old reset tokens for this email
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: validatedEmail,
        },
      });

      // Generate reset token
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Create reset token
      await prisma.verificationToken.create({
        data: {
          identifier: validatedEmail,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      });

      // Send reset email (if Resend is configured)
      if (process.env.RESEND_API_KEY) {
        try {
          const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
          
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@photonsolar.be",
            to: validatedEmail,
            subject: "Réinitialisation de votre mot de passe - Photon Solar",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Réinitialisation de mot de passe</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background-color: #E67E22; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0;">Photon Solar</h1>
                  </div>
                  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #E67E22; margin-top: 0;">Réinitialisation de mot de passe</h2>
                    <p>Bonjour ${user.name || "Utilisateur"},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" style="background-color: #E67E22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Réinitialiser mon mot de passe</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Ou copiez-collez ce lien dans votre navigateur :</p>
                    <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">Ce lien expirera dans 1 heure.</p>
                    <p style="font-size: 14px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe ne sera pas modifié.</p>
                  </div>
                  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} Photon Solar. Tous droits réservés.</p>
                  </div>
                </body>
              </html>
            `,
          });
        } catch (emailError) {
          console.error("Error sending reset email:", emailError);
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
          message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
        },
        { status: 200 }
      );
    }

    // Handle password reset (with token)
    if (action === "reset") {
      // Validate input
      const validationResult = resetPasswordSchema.safeParse({
        token,
        password,
        confirmPassword,
      });

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

      const { token: validatedToken, password: validatedPassword } = validationResult.data;

      // Find reset token
      const resetToken = await prisma.verificationToken.findUnique({
        where: { token: validatedToken },
      });

      if (!resetToken) {
        return NextResponse.json(
          {
            error: "Token invalide ou expiré.",
          },
          { status: 400 }
        );
      }

      // Check if token is expired
      if (resetToken.expires < new Date()) {
        // Delete expired token
        await prisma.verificationToken.delete({
          where: { token: validatedToken },
        });

        return NextResponse.json(
          {
            error: "Le token a expiré. Veuillez demander un nouveau lien de réinitialisation.",
          },
          { status: 400 }
        );
      }

      // Find user by email (from token identifier)
      const user = await prisma.user.findUnique({
        where: { email: resetToken.identifier },
      });

      if (!user) {
        return NextResponse.json(
          {
            error: "Utilisateur non trouvé.",
          },
          { status: 404 }
        );
      }

      // Hash new password
      const hashedPassword = await hash(validatedPassword, 12);

      // Update user password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      // Delete reset token (one-time use)
      await prisma.verificationToken.delete({
        where: { token: validatedToken },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "Action invalide. Utilisez 'request' ou 'reset'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

