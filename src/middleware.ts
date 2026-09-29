import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Helper functions using standard JavaScript/RegExp matching
const isPublicRoute = (pathname: string) =>
  pathname === "/" ||
  /^\/sign-in($|\/)/.test(pathname) ||
  /^\/sign-up($|\/)/.test(pathname) ||
  /^\/api\/public($|\/)/.test(pathname);

const isClientRoute = (pathname: string) =>
  /^\/foundation($|\/)/.test(pathname) ||
  /^\/story($|\/)/.test(pathname);

const isAdminRoute = (pathname: string) =>
  /^\/admin($|\/)/.test(pathname) ||
  /^\/admin-portal($|\/)/.test(pathname) ||
  /^\/api\/admin($|\/)/.test(pathname);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // 1. Allow public routes to bypass auth checks immediately
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();
  const isApiRequest = pathname.startsWith("/api");

  // 2. Client Routes Protection (/foundation, /story)
  if (isClientRoute(pathname) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Admin Routes Protection (/admin, /admin-portal, /api/admin)
  if (isAdminRoute(pathname)) {
    // A. Unauthenticated Attempt
    if (!userId) {
      if (isApiRequest) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // B. Role Verification Check from Clerk Public Metadata
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin") {
      if (isApiRequest) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Non-admins get redirected to 404 to obfuscate admin routes
      return NextResponse.redirect(new URL("/404", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpeg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};