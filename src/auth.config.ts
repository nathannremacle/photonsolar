import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
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
 * NextAuth configuration (Edge-compatible, no Prisma)
 * 
 * This configuration is used by the middleware and does not include
 * the Prisma adapter or any database dependencies.
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Note: The actual authorization logic with Prisma is in auth.ts
      // This is just a placeholder for the config
      async authorize() {
        // This will be overridden in auth.ts with the actual Prisma logic
        return null;
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
