import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

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
 * NextAuth configuration
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
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
  session: {
    strategy: "jwt", // Using JWT for better serverless compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login", // Error code passed in query string as ?error=
    verifyRequest: "/login", // Used for email verification
    newUser: "/register", // New users will be redirected here
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Handle session update (for profile updates, etc.)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.image) token.picture = session.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Log sign in events (optional, for analytics)
      if (isNewUser) {
        console.log(`New user signed up: ${user.email}`);
      } else {
        console.log(`User signed in: ${user.email}`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5 in some deployment scenarios
};

/**
 * Export the configured NextAuth handler
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

