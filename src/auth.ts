import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

/**
 * Validation schema for credentials login
 */
const loginSchema = z.object({
  email: z
    .string()
    .email("L'email n'est pas valide")
    .min(1, "L'email est requis"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

/**
 * NextAuth configuration with Prisma adapter
 * 
 * This extends the base config from auth.config.ts and adds:
 * - Prisma adapter for database operations
 * - Full authorization logic with Prisma
 * 
 * @see https://next-auth.js.org/configuration/options
 */
const fullAuthConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input with Zod
          const validatedFields = loginSchema.safeParse(credentials);

          if (!validatedFields.success) {
            return null;
          }

          const { email, password } = validatedFields.data;

          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: email.toLowerCase(),
            },
          });

          if (!user || !user.password) {
            // Don't reveal if user exists or not (security best practice)
            return null;
          }

          // Check if email is verified (if email verification is enabled)
          // Uncomment if you want to enforce email verification:
          // if (!user.emailVerified) {
          //   return null; // Return null instead of throwing to show generic error
          // }

          // Verify password
          const isPasswordValid = await compare(password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Return user object (will be available in session)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
};

/**
 * Export the configured NextAuth handler
 * This includes the Prisma adapter and full database logic
 */
export const { handlers, signIn, signOut, auth } = NextAuth(fullAuthConfig);

