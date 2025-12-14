import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";
import { registrationRateLimiter, getClientIP } from "@/lib/rate-limit";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/register
 * 
 * Register a new user account
 * - Validates input with Zod
 * - Checks if email already exists
 * - Hashes password with bcrypt
 * - Creates user in database
 * - Sends verification email (if enabled)
 * - Rate limited: 3 registrations per hour per IP
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = await registrationRateLimiter.limit(clientIP);

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset);
      const minutesLeft = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 1000));
      
      return NextResponse.json(
        {
          error: `Trop de tentatives d'inscription. Veuillez réessayer dans ${minutesLeft} minute(s).`,
          rateLimited: true,
          resetAt: resetTime.toISOString(),
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = signUpSchema.safeParse(body);

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

    const { name, email, password, phoneNumber, companyName } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Un compte avec cet email existe déjà.",
          field: "email",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber, // Required field
        companyName: companyName || null, // Optional field
        emailVerified: null, // Will be set when email is verified
      },
    });

    // Create verification token in database
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
                  <h2 style="color: #E67E22; margin-top: 0;">Bienvenue ${name} !</h2>
                  <p>Merci de vous être inscrit sur Photon Solar. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #E67E22; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Vérifier mon email</a>
                  </div>
                  <p style="font-size: 14px; color: #666;">Ou copiez-collez ce lien dans votre navigateur :</p>
                  <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
                  <p style="font-size: 14px; color: #666; margin-top: 30px;">Ce lien expirera dans 24 heures.</p>
                  <p style="font-size: 14px; color: #666;">Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
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
        // Don't fail registration if email fails, just log it
      }
    }

    // Return success (don't return password hash)
    return NextResponse.json(
      {
        success: true,
        message: "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

