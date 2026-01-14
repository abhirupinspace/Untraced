import { NextRequest, NextResponse } from "next/server";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_REDIRECT_URI = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL}/api/auth/twitter/callback`
  : "http://localhost:3000/api/auth/twitter/callback";

interface TwitterTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
    public_metrics?: {
      followers_count: number;
      following_count: number;
      tweet_count: number;
    };
    verified?: boolean;
    created_at?: string;
  };
}

/**
 * Handle Twitter OAuth 2.0 callback
 * Exchanges authorization code for access token using PKCE
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
  const stateCookie = request.cookies.get("twitter_oauth_state")?.value;
  if (!stateCookie) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Invalid+state",
        request.url
      )
    );
  }

  let stateData: { state: string; codeVerifier: string; returnUrl: string };
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
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Server+configuration+error",
        request.url
      )
    );
  }

  try {
    // Exchange code for access token using PKCE
    const basicAuth = Buffer.from(
      `${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: TWITTER_REDIRECT_URI,
        code_verifier: stateData.codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Twitter token error:", errorText);
      return NextResponse.redirect(
        new URL(
          "/dashboard/playground?oauth_error=Failed+to+get+access+token",
          request.url
        )
      );
    }

    const tokenData: TwitterTokenResponse = await tokenResponse.json();

    // Fetch user profile
    const userResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified,created_at",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/playground?oauth_error=Failed+to+fetch+user+profile",
          request.url
        )
      );
    }

    const userData: TwitterUserResponse = await userResponse.json();

    // Redirect back to return URL with connection success
    const returnPath = stateData.returnUrl || "/dashboard/playground";
    const returnUrl = new URL(returnPath, request.url);
    returnUrl.searchParams.set("twitter_connected", "true");
    returnUrl.searchParams.set("twitter_username", userData.data.username);

    const response = NextResponse.redirect(returnUrl);

    // Store access token in httpOnly cookie (expires based on token expiry or 2 hours default)
    const expiresIn = tokenData.expires_in || 7200;
    response.cookies.set("twitter_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    // Store refresh token if provided
    if (tokenData.refresh_token) {
      response.cookies.set("twitter_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // Store user info in a non-httpOnly cookie for client access
    response.cookies.set(
      "twitter_user",
      JSON.stringify({
        username: userData.data.username,
        name: userData.data.name,
        avatar: userData.data.profile_image_url,
        followers: userData.data.public_metrics?.followers_count || 0,
        tweets: userData.data.public_metrics?.tweet_count || 0,
        verified: userData.data.verified || false,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expiresIn,
        path: "/",
      }
    );

    // Clear state cookie
    response.cookies.delete("twitter_oauth_state");

    return response;
  } catch (error) {
    console.error("Twitter OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard/playground?oauth_error=Authentication+failed",
        request.url
      )
    );
  }
}
