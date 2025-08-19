// Google OAuth Configuration - Standard OAuth 2.0 Flow
export const GOOGLE_CONFIG = {
  CLIENT_ID: '204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com',
  REDIRECT_URI: window.location.origin,
  SCOPE: 'openid email profile'
};

// Google OAuth URLs
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

/**
 * Generate Google OAuth authorization URL and redirect
 */
export const redirectToGoogleAuth = () => {
  const state = generateRandomState();
  localStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
    response_type: 'token id_token', // Use implicit flow for frontend apps
    scope: GOOGLE_CONFIG.SCOPE,
    prompt: 'select_account',
    state: state,
    nonce: generateRandomState() // Additional security
  });
  
  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
  
  // Redirect to Google OAuth
  window.location.href = authUrl;
};

/**
 * Handle OAuth callback and extract tokens from URL hash
 */
export const handleOAuthCallback = () => {
  const hash = window.location.hash;
  
  if (!hash) {
    return null;
  }
  
  // Parse hash parameters
  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const idToken = params.get('id_token');
  const state = params.get('state');
  const error = params.get('error');
  
  if (error) {
    throw new Error(`OAuth error: ${error}`);
  }
  
  // Validate state parameter
  const storedState = localStorage.getItem('oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter - potential CSRF attack');
  }
  
  // Clear stored state
  localStorage.removeItem('oauth_state');
  
  if (idToken) {
    try {
      const userData = parseJWTToken(idToken);
      return userData;
    } catch (error) {
      throw new Error('Failed to parse ID token: ' + error.message);
    }
  }
  
  return null;
};

/**
 * Check if current URL contains OAuth callback
 */
export const isOAuthCallback = () => {
  const hash = window.location.hash;
  return hash && (hash.includes('access_token') || hash.includes('id_token') || hash.includes('error'));
};

/**
 * Parse JWT token to extract user info
 */
export const parseJWTToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified: payload.email_verified,
      given_name: payload.given_name,
      family_name: payload.family_name
    };
  } catch (error) {
    throw new Error('Failed to parse JWT token: ' + error.message);
  }
};

/**
 * Generate random state for CSRF protection
 */
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Store user data securely
 */
export const storeUserData = (userData) => {
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
 * Clear user data and URL hash
 */
export const clearUserData = () => {
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth_timestamp');
  localStorage.removeItem('oauth_state');
  
  // Clear URL hash if it contains OAuth data
  if (window.location.hash && isOAuthCallback()) {
    window.history.replaceState(null, null, window.location.pathname);
  }
};