import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/github/callback`
  : "http://localhost:3000/api/auth/github/callback";

/**
 * Initiate GitHub OAuth flow
 * Redirects user to GitHub authorization page
 */
export async function GET(request: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = randomBytes(16).toString("hex");

  // Get the return URL from query params
  const searchParams = request.nextUrl.searchParams;
  const returnUrl = searchParams.get("returnUrl") || "/dashboard/playground";

  // Store state and return URL in a cookie
  const stateData = JSON.stringify({ state, returnUrl });

  // Build GitHub authorization URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: "read:user user:email repo",
    state,
    allow_signup: "true",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  // Create response with redirect
  const response = NextResponse.redirect(authUrl);

  // Set state cookie (httpOnly, secure in production)
  response.cookies.set("github_oauth_state", stateData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
