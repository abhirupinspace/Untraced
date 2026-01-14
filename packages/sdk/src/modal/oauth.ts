/**
 * OAuth Helper Module
 * Handles OAuth popup flows for GitHub and Twitter verification
 */

export type OAuthProvider = "github" | "twitter";

interface OAuthResult {
  accessToken: string;
  provider: OAuthProvider;
}

interface OAuthError {
  error: string;
  provider: OAuthProvider;
}

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POLL_INTERVAL = 500; // Check every 500ms

/**
 * Calculate centered popup position
 */
function getPopupPosition() {
  const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
  const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
  return { left, top };
}

/**
 * Open OAuth popup window
 */
function openOAuthPopup(url: string): Window | null {
  const { left, top } = getPopupPosition();

  const features = [
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${left}`,
    `top=${top}`,
    'toolbar=no',
    'menubar=no',
    'location=no',
    'status=no',
    'scrollbars=yes',
    'resizable=yes',
  ].join(',');

  return window.open(url, 'oauth_popup', features);
}

/**
 * Wait for OAuth callback via popup communication
 */
function waitForOAuthCallback(
  popup: Window,
  provider: OAuthProvider
): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`OAuth timeout for ${provider}`));
    }, 5 * 60 * 1000); // 5 minute timeout

    // Listen for messages from popup
    const messageHandler = (event: MessageEvent) => {
      // Validate origin in production
      // if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'oauth_success' && event.data?.provider === provider) {
        cleanup();
        resolve({
          accessToken: event.data.accessToken,
          provider,
        });
      } else if (event.data?.type === 'oauth_error' && event.data?.provider === provider) {
        cleanup();
        reject(new Error(event.data.error || `OAuth failed for ${provider}`));
      }
    };

    window.addEventListener('message', messageHandler);

    // Poll to detect if popup was closed manually
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error(`OAuth cancelled by user for ${provider}`));
      }
    }, POLL_INTERVAL);

    function cleanup() {
      clearTimeout(timeout);
      clearInterval(pollTimer);
      window.removeEventListener('message', messageHandler);
      if (popup && !popup.closed) {
        popup.close();
      }
    }
  });
}

/**
 * Start GitHub OAuth flow
 */
export async function authenticateGitHub(apiUrl: string): Promise<string> {
  const returnUrl = encodeURIComponent('/oauth-callback?provider=github');
  const authUrl = `${apiUrl}/auth/github?returnUrl=${returnUrl}`;

  const popup = openOAuthPopup(authUrl);

  if (!popup) {
    throw new Error('Failed to open OAuth popup. Please check your popup blocker settings.');
  }

  try {
    const result = await waitForOAuthCallback(popup, 'github');
    return result.accessToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Start Twitter OAuth flow
 */
export async function authenticateTwitter(apiUrl: string): Promise<string> {
  const returnUrl = encodeURIComponent('/oauth-callback?provider=twitter');
  const authUrl = `${apiUrl}/auth/twitter?returnUrl=${returnUrl}`;

  const popup = openOAuthPopup(authUrl);

  if (!popup) {
    throw new Error('Failed to open OAuth popup. Please check your popup blocker settings.');
  }

  try {
    const result = await waitForOAuthCallback(popup, 'twitter');
    return result.accessToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Generic OAuth authenticator
 */
export async function authenticate(
  provider: OAuthProvider,
  apiUrl: string
): Promise<string> {
  switch (provider) {
    case 'github':
      return authenticateGitHub(apiUrl);
    case 'twitter':
      return authenticateTwitter(apiUrl);
    default:
      throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
}
