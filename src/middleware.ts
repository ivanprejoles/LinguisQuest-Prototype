import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Helper functions using standard JavaScript/RegExp matching
const isPublicRoute = (pathname: string) =>
  pathname === "/" ||
  /^\/sign-in($|\/)/.test(pathname) ||
  /^\/sign-up($|\/)/.test(pathname) ||
  /^\/api\/public($|\/)/.test(pathname);

const isAdminRoute = (pathname: string) =>
  /^\/admin($|\/)/.test(pathname) ||
  /^\/admin-portal($|\/)/.test(pathname) ||
  /^\/api\/admin($|\/)/.test(pathname);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims } = await auth();
  const isApiRequest = pathname.startsWith("/api");

  // Extract user role from Clerk session metadata (ensure publicMetadata is synced in Clerk)
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 1. Redirect Authenticated Users Away From Public Landing / Auth Pages
  if (userId && isPublicRoute(pathname) && !isApiRequest) {
    if (role === "admin") {
      return NextResponse.redirect(new URL(`/admin-portal/${userId}`, req.url));
    }
    // Standard learner redirection goes straight to /languages
    return NextResponse.redirect(new URL("/language", req.url));
  }

  // 2. Unauthenticated Public Access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
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

    // B. Role Verification Check
    if (role !== "admin") {
      if (isApiRequest) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      // Non-admins get redirected to 404 to obfuscate admin routes
      return NextResponse.redirect(new URL("/404", req.url));
    }
    
    return NextResponse.next();
  }

  // 4. Default Catch-all for Protected Client Routes (/languages, /stage, /profile, etc.)
  // If it's not public and not admin, it requires authentication.
  if (!userId) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpeg|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};