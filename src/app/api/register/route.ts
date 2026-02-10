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

    const { name, email, password, phoneNumber, companyName, role } = validationResult.data;

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

    // Check if user already exists (select only id to avoid requiring role column)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
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

    // Build create data: only include role when it has a valid value (so DB without role column still works)
    const createData: {
      email: string;
      password: string;
      name: string;
      phoneNumber: string;
      companyName: string | null;
      role?: "PARTICULIER" | "INSTALLATEUR" | "REVENDEUR" | "AUTRE";
    } = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      phoneNumber: cleanedPhoneNumber,
      companyName: companyName || null,
    };
    const validRole = role && ["PARTICULIER", "INSTALLATEUR", "REVENDEUR", "AUTRE"].includes(role);
    if (validRole) createData.role = role as "PARTICULIER" | "INSTALLATEUR" | "REVENDEUR" | "AUTRE";

    let user: { id: string; name: string | null; email: string; phoneNumber: string; companyName: string | null; createdAt: Date };
    try {
      user = await prisma.user.create({
        data: createData,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          companyName: true,
          createdAt: true,
        },
      });
    } catch (createError: unknown) {
      const errMsg = createError instanceof Error ? createError.message : String(createError);
      if (errMsg.includes("role") || errMsg.includes("column") || (typeof createError === "object" && createError !== null && "code" in createError && (createError as { code?: string }).code === "P2010")) {
        try {
          const { randomBytes } = await import("crypto");
          const id = `c${randomBytes(12).toString("hex")}`;
          await prisma.$executeRaw`
            INSERT INTO users (id, name, email, password, "phoneNumber", "companyName", "createdAt", "updatedAt")
            VALUES (${id}, ${name}, ${email.toLowerCase()}, ${hashedPassword}, ${cleanedPhoneNumber}, ${companyName || null}, NOW(), NOW())
          `;
          const created = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, phoneNumber: true, companyName: true, createdAt: true },
          });
          if (!created) throw new Error("User not found after insert");
          user = created;
        } catch (rawError) {
          console.error("Registration fallback error:", rawError);
          return NextResponse.json(
            {
              success: false,
              error: "La base de données doit être mise à jour. Exécutez à la racine du projet : npx prisma db push",
              details: errMsg,
            },
            { status: 500 }
          );
        }
      } else {
        throw createError;
      }
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint") || error.message.includes("P2002")) {
        return NextResponse.json(
          { success: false, error: "Un compte avec cet email existe déjà.", field: "email" },
          { status: 409 }
        );
      }
      if (error.message.includes("phoneNumber") || error.message.includes("Required")) {
        return NextResponse.json(
          { success: false, error: "Le numéro de téléphone est requis.", field: "phoneNumber" },
          { status: 500 }
        );
      }
      if (error.message.includes("Can't reach database") || error.message.includes("P1001")) {
        return NextResponse.json(
          { success: false, error: "Impossible de se connecter à la base de données. Vérifiez votre configuration." },
          { status: 500 }
        );
      }
      if (error.message.includes("Invalid value") || error.message.includes("Argument")) {
        return NextResponse.json(
          { success: false, error: "Données invalides pour la création de l'utilisateur.", details: error.message },
          { status: 400 }
        );
      }
      console.error("Full error details:", { message: error.message, stack: error.stack });
    }

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

