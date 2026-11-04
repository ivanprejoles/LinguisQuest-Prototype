import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = (pathname: string) =>
  pathname === "/" ||
  /^\/sign-in($|\/)/.test(pathname) ||
  /^\/sign-up($|\/)/.test(pathname) ||
  /^\/privacy-policy($|\/)/.test(pathname) ||
  /^\/terms($|\/)/.test(pathname) ||
  /^\/contact($|\/)/.test(pathname) ||
  /^\/api\/public($|\/)/.test(pathname);

const isAdminRoute = (pathname: string) =>
  /^\/admin($|\/)/.test(pathname) ||
  /^\/admin-portal($|\/)/.test(pathname) ||
  /^\/api\/admin($|\/)/.test(pathname);

const isUserRoute = (pathname: string) =>
  /^\/language($|\/)/.test(pathname) ||
  /^\/leaderboards($|\/)/.test(pathname) ||
  /^\/profile($|\/)/.test(pathname) ||
  /^\/api\/user($|\/)/.test(pathname) ||
  /^\/api\/users($|\/)/.test(pathname);

const isApiRequest = (pathname: string) =>
  pathname.startsWith("/api/") ||
  pathname === "/api" ||
  pathname.startsWith("/trpc/") ||
  pathname === "/trpc";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const { userId, sessionClaims } = await auth();

  const isApi = isApiRequest(pathname);

  const role = (
    sessionClaims?.metadata as { role?: string } | undefined
  )?.role;

  if (userId && isPublicRoute(pathname) && !isApi) {
    if (role === "admin") {
      return NextResponse.redirect(
        new URL(`/admin-portal/${userId}`, req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/language", req.url)
    );
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!userId) {
    if (isApi) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);

    return NextResponse.redirect(signInUrl);
  }

  if (isAdminRoute(pathname)) {
    if (role !== "admin") {
      if (isApi) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(
        new URL("/language", req.url)
      );
    }

    return NextResponse.next();
  }

  if (isUserRoute(pathname)) {
    if (role === "admin") {
      if (isApi) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(
        new URL(`/admin-portal/${userId}`, req.url)
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
