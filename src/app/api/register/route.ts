import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

/**
 * POST /api/register
 * 
 * Register a new user account
 * - Validates input with Zod schema
 * - Checks if user already exists
 * - Hashes password with bcryptjs
 * - Creates user in database
 * - Returns user without password
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Log received data for debugging (without password)
    console.log("Registration attempt - raw body:", {
      email: body.email,
      name: body.name,
      phoneNumber: body.phoneNumber,
      phoneNumberType: typeof body.phoneNumber,
      phoneNumberLength: body.phoneNumber?.length,
      companyName: body.companyName,
      hasPassword: !!body.password,
    });

    // Validate with Zod schema
    const validationResult = signUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error.errors);
      console.error("Validation error details:", JSON.stringify(validationResult.error.errors, null, 2));
    } else {
      console.log("Validation successful - validated data:", {
        email: validationResult.data.email,
        name: validationResult.data.name,
        phoneNumber: validationResult.data.phoneNumber,
        phoneNumberType: typeof validationResult.data.phoneNumber,
        phoneNumberLength: validationResult.data.phoneNumber?.length,
        companyName: validationResult.data.companyName,
      });
    }

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
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

    // Verify phoneNumber is present
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      console.error("phoneNumber is missing after validation:", validationResult.data);
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro de téléphone est requis.",
          field: "phoneNumber",
        },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanedPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");
    
    // Verify cleaned phone number is not empty
    if (!cleanedPhoneNumber || cleanedPhoneNumber.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Le numéro de téléphone n'est pas valide.",
          field: "phoneNumber",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Un compte avec cet email existe déjà.",
          field: "email",
        },
        { status: 409 }
      );
    }

    // Hash password with bcryptjs
    const hashedPassword = await hash(password, 12);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name,
        phoneNumber: cleanedPhoneNumber,
        companyName: companyName || null,
      },
    });

    // Return user without password (explicitly exclude password field)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle Prisma errors
    if (error instanceof Error) {
      // Check for unique constraint violation
      if (error.message.includes("Unique constraint") || error.message.includes("P2002")) {
        return NextResponse.json(
          {
            success: false,
            error: "Un compte avec cet email existe déjà.",
            field: "email",
          },
          { status: 409 }
        );
      }

      // Check for missing required field (phoneNumber)
      if (error.message.includes("phoneNumber") || error.message.includes("Required")) {
        return NextResponse.json(
          {
            success: false,
            error: "Le numéro de téléphone est requis. Veuillez mettre à jour la base de données avec 'npx prisma db push'.",
            field: "phoneNumber",
          },
          { status: 500 }
        );
      }

      // Check for database connection issues
      if (error.message.includes("Can't reach database") || error.message.includes("P1001")) {
        return NextResponse.json(
          {
            success: false,
            error: "Impossible de se connecter à la base de données. Vérifiez votre configuration.",
          },
          { status: 500 }
        );
      }

      // Check for Prisma validation errors
      if (error.message.includes("Invalid value") || error.message.includes("Argument")) {
        return NextResponse.json(
          {
            success: false,
            error: "Données invalides pour la création de l'utilisateur.",
            details: error.message,
          },
          { status: 400 }
        );
      }

      // Log the full error for debugging
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    // Always return a valid JSON response
    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

