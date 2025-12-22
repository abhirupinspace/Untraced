import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_API_ROUTES = [
  "/api/projects",
  "/api/flows",
  "/api/auth/me",
];

// Routes that don't require authentication
const PUBLIC_API_ROUTES = [
  "/api/attest",
  "/api/modules",
  "/api/auth/github",
  "/api/auth/twitter",
  "/api/auth/tokens",
  "/api/verify",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for authentication headers
    const privyId = request.headers.get("x-privy-id");
    const walletAddress = request.headers.get("x-wallet-address");
    const authHeader = request.headers.get("authorization");

    // Require at least privy-id and wallet-address
    if (!privyId || !walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized - Missing authentication headers" },
        { status: 401 }
      );
    }

    // Clone request headers and pass through
    const requestHeaders = new Headers(request.headers);

    // Forward the request with verified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
