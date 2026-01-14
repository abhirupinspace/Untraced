"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const provider = searchParams.get("provider");
    const githubConnected = searchParams.get("github_connected");
    const twitterConnected = searchParams.get("twitter_connected");
    const error = searchParams.get("oauth_error");

    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));

      // Send error to opener
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "oauth_error",
            provider,
            error: decodeURIComponent(error),
          },
          window.location.origin
        );

        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 2000);
      }
      return;
    }

    // Get access token from cookie
    const getAccessTokenFromCookie = (provider: string) => {
      const cookieName = `${provider}_access_token`;
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === cookieName) {
          return value;
        }
      }
      return null;
    };

    if (provider === "github" && githubConnected === "true") {
      const accessToken = getAccessTokenFromCookie("github");

      if (accessToken && window.opener) {
        setStatus("success");
        setMessage("GitHub authentication successful! You can close this window.");

        // Send success message to opener with access token
        window.opener.postMessage(
          {
            type: "oauth_success",
            provider: "github",
            accessToken,
          },
          window.location.origin
        );

        // Close popup automatically
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setStatus("error");
        setMessage("Failed to retrieve access token");
      }
    } else if (provider === "twitter" && twitterConnected === "true") {
      const accessToken = getAccessTokenFromCookie("twitter");

      if (accessToken && window.opener) {
        setStatus("success");
        setMessage("Twitter authentication successful! You can close this window.");

        // Send success message to opener with access token
        window.opener.postMessage(
          {
            type: "oauth_success",
            provider: "twitter",
            accessToken,
          },
          window.location.origin
        );

        // Close popup automatically
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        setStatus("error");
        setMessage("Failed to retrieve access token");
      }
    } else {
      setStatus("error");
      setMessage("Invalid OAuth callback parameters");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-4 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-lg text-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-6xl">✓</div>
            <h2 className="text-2xl font-bold text-foreground">Success!</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-6xl">✕</div>
            <h2 className="text-2xl font-bold text-foreground">Error</h2>
            <p className="text-muted-foreground">{message}</p>
            <button
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Close Window
            </button>
          </>
        )}
      </div>
    </div>
  );
}
