import { NextResponse } from "next/server";
import { metadata } from "./app/layout";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

const routeAccessMap = {
  "/admin(.*)": ["admin"],
};

const matchers = Object.keys(routeAccessMap).map((route) => {
  return {
    matcher: createRouteMatcher([route]),
    allowedRoles: routeAccessMap[route],
  };
});

console.log(JSON.stringify(matchers));

export default clerkMiddleware((auth, request) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(request) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
