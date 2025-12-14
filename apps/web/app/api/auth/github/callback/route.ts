import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/github/callback`
  : "http://localhost:3000/api/auth/github/callback";

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  email: string;
  public_repos: number;
  followers: number;
  created_at: string;
}

/**
 * Handle GitHub OAuth callback
 * Exchanges authorization code for access token
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Handle OAuth errors
  if (error) {
    const errorDesc = searchParams.get("error_description") || "Unknown error";
    return NextResponse.redirect(
      new URL(
        `/dashboard/playground?oauth_error=${encodeURIComponent(errorDesc)}`,
        request.url
      )
    );
  }

  // Validate code and state
  if (!code || !state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Missing+authorization+code",
        request.url
      )
    );
  }

  // Verify state from cookie
  const stateCookie = request.cookies.get("github_oauth_state")?.value;
  if (!stateCookie) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Invalid+state",
        request.url
      )
    );
  }

  let stateData: { state: string; returnUrl: string };
  try {
    stateData = JSON.parse(stateCookie);
  } catch {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Invalid+state+format",
        request.url
      )
    );
  }

  if (stateData.state !== state) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=State+mismatch",
        request.url
      )
    );
  }

  // Check OAuth configuration
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Server+configuration+error",
        request.url
      )
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      }
    );

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error("GitHub token error:", tokenData.error_description);
      return NextResponse.redirect(
        new URL(
          `/dashboard/playground?oauth_error=${encodeURIComponent(
            tokenData.error_description || "Failed to get access token"
          )}`,
          request.url
        )
      );
    }

    // Fetch user profile to get username
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "UNTRACED",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/playground?oauth_error=Failed+to+fetch+user+profile",
          request.url
        )
      );
    }

    const userData: GitHubUser = await userResponse.json();

    // Redirect back to playground with token and user info
    const returnUrl = new URL(stateData.returnUrl || "/dashboard/playground", request.url);
    returnUrl.searchParams.set("github_connected", "true");
    returnUrl.searchParams.set("github_username", userData.login);

    const response = NextResponse.redirect(returnUrl);

    // Store access token in httpOnly cookie (expires in 8 hours)
    response.cookies.set("github_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    // Store user info in a non-httpOnly cookie for client access
    response.cookies.set(
      "github_user",
      JSON.stringify({
        username: userData.login,
        name: userData.name,
        avatar: userData.avatar_url,
        repos: userData.public_repos,
        followers: userData.followers,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8,
        path: "/",
      }
    );

    // Clear state cookie
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Authentication+failed",
        request.url
      )
    );
  }
}
