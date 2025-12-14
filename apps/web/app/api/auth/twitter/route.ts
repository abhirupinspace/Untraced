import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/twitter/callback`
  : "http://localhost:3000/api/auth/twitter/callback";

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  return randomBytes(32)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate code challenge from verifier (S256)
 */
function generateCodeChallenge(verifier: string): string {
  const hash = createHash("sha256").update(verifier).digest("base64");
  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Initiate Twitter OAuth 2.0 flow with PKCE
 * Redirects user to Twitter authorization page
 */
export async function GET(request: NextRequest) {
  if (!TWITTER_CLIENT_ID) {
    return NextResponse.json(
      { error: "Twitter OAuth not configured" },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = randomBytes(16).toString("hex");

  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Get the return URL from query params
  const searchParams = request.nextUrl.searchParams;
  const returnUrl = searchParams.get("returnUrl") || "/dashboard/playground";

  // Store state, code verifier, and return URL in a cookie
  const stateData = JSON.stringify({ state, codeVerifier, returnUrl });

  // Build Twitter authorization URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: TWITTER_REDIRECT_URI,
    scope: "tweet.read users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

  // Create response with redirect
  const response = NextResponse.redirect(authUrl);

  // Set state cookie (httpOnly, secure in production)
  response.cookies.set("twitter_oauth_state", stateData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
