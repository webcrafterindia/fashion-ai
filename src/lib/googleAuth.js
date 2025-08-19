// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  // Replace with your actual Google OAuth Client ID from Google Cloud Console
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com',
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  SCOPE: 'openid email profile'
};

// Google OAuth URLs
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Generate Google OAuth authorization URL
 */
export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_CONFIG.SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: generateRandomState()
  });

  // Store state in localStorage for validation
  const state = params.get('state');
  localStorage.setItem('oauth_state', state);

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

/**
 * Generate random state for CSRF protection
 */
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

/**
 * Exchange authorization code for access token
 * Note: For frontend apps, we use the implicit flow with ID tokens
 */
export const exchangeCodeForToken = async (code, state) => {
  // Validate state parameter
  const storedState = localStorage.getItem('oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter - potential CSRF attack');
  }

  // Clear stored state
  localStorage.removeItem('oauth_state');

  try {
    // For frontend-only apps, we'll use a simpler approach
    // The ID token contains user info, so we don't need the token exchange
    // Instead, we'll fetch user info directly with the code
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      // If token exchange fails, we can still proceed with user info from the URL hash
      // or use a different approach
      console.warn('Token exchange failed, using alternative method');
      return { error: 'token_exchange_failed' };
    }

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Token exchange error:', error);
    // Return error but don't throw to allow fallback methods
    return { error: error.message };
  }
};

/**
 * Get user info from Google API
 */
export const getGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('User info fetch error:', error);
    throw error;
  }
};

/**
 * Parse JWT token (basic parsing, for production use a proper JWT library)
 */
export const parseJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT parsing error:', error);
    return null;
  }
};

/**
 * Store user data securely
 */
export const storeUserData = (userData) => {
  // Store in localStorage (in production, consider more secure storage)
  localStorage.setItem('user_data', JSON.stringify(userData));
  localStorage.setItem('auth_timestamp', Date.now().toString());
};

/**
 * Get stored user data
 */
export const getStoredUserData = () => {
  try {
    const userData = localStorage.getItem('user_data');
    const timestamp = localStorage.getItem('auth_timestamp');

    if (!userData || !timestamp) {
      return null;
    }

    // Check if auth is expired (24 hours)
    const authAge = Date.now() - parseInt(timestamp);
    const MAX_AUTH_AGE = 24 * 60 * 60 * 1000; // 24 hours

    if (authAge > MAX_AUTH_AGE) {
      clearUserData();
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting stored user data:', error);
    return null;
  }
};

/**
 * Clear user data
 */
export const clearUserData = () => {
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth_timestamp');
  localStorage.removeItem('oauth_state');
};