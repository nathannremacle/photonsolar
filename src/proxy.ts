import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Proxy: protect private routes (auth, admin).
 * Protected: /profile, /account, /admin/*
 * Public auth routes redirect to / when authenticated: /login, /register
 */
const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  try {
    const session = await auth();

    const { pathname } = request.nextUrl;

    const protectedRoutes = ["/profile", "/account"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    const publicAuthRoutes = ["/login", "/register"];
    const isPublicAuthRoute = publicAuthRoutes.includes(pathname);

    if (isProtectedRoute && !session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isPublicAuthRoute && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/admin") && pathname !== "/admin") {
      const adminCookie = request.cookies.get("admin_session");
      if (!adminCookie?.value) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
