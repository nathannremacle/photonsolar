import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Middleware to protect private routes
 * 
 * Protected routes:
 * - /profile
 * - /dashboard (if you add a user dashboard)
 * - Any route starting with /account
 * 
 * Public routes that redirect if authenticated:
 * - /login (redirects to / if already logged in)
 * - /register (redirects to / if already logged in)
 */
export async function middleware(request: NextRequest) {
  try {
    const session = await auth();

    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = ["/profile", "/account"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Define public routes that should redirect if authenticated
    const publicAuthRoutes = ["/login", "/register"];
    const isPublicAuthRoute = publicAuthRoutes.includes(pathname);

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect to home if accessing login/register while authenticated
    if (isPublicAuthRoute && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If auth fails (e.g., database connection issue), allow request to proceed
    // This prevents middleware from breaking the app
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

