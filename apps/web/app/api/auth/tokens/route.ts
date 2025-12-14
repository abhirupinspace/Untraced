import { NextRequest, NextResponse } from "next/server";

/**
 * Get OAuth tokens for attestation
 * Returns tokens stored in httpOnly cookies
 */
export async function GET(request: NextRequest) {
  const githubToken = request.cookies.get("github_access_token")?.value;
  const twitterToken = request.cookies.get("twitter_access_token")?.value;

  return NextResponse.json({
    github: githubToken ? { connected: true, token: githubToken } : { connected: false },
    twitter: twitterToken ? { connected: true, token: twitterToken } : { connected: false },
  });
}

/**
 * Disconnect OAuth accounts
 */
export async function DELETE(request: NextRequest) {
  const { provider } = await request.json();

  const response = NextResponse.json({ success: true });

  if (provider === "github" || provider === "all") {
    response.cookies.delete("github_access_token");
    response.cookies.delete("github_user");
  }

  if (provider === "twitter" || provider === "all") {
    response.cookies.delete("twitter_access_token");
    response.cookies.delete("twitter_refresh_token");
    response.cookies.delete("twitter_user");
  }

  return response;
}
