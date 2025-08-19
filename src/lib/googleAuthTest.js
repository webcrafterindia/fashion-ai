// Test Google OAuth with different redirect URI options
export const GOOGLE_CONFIG = {
  CLIENT_ID: '204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com',
  SCOPE: 'openid email profile'
};

// Test different redirect URI options
export const getRedirectURI = (option = 'auto') => {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  
  switch (option) {
    case 'origin':
      return origin; // http://localhost:5000
    case 'origin-slash':
      return origin + '/'; // http://localhost:5000/
    case 'full-path':
      return origin + pathname; // http://localhost:5000/current/path
    case 'root-slash':
      return origin + '/'; // Always root with slash
    case 'auto':
    default:
      return origin; // Default to origin without trailing slash
  }
};

/**
 * Create Google OAuth URL with specified redirect URI option
 */
export const createOAuthURL = (redirectOption = 'auto') => {
  const redirectUri = getRedirectURI(redirectOption);
  const state = generateRandomState();
  localStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: GOOGLE_CONFIG.SCOPE,
    prompt: 'select_account',
    state: state,
    nonce: generateRandomState()
  });
  
  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    redirectUri: redirectUri
  };
};

/**
 * Test different redirect URI options
 */
export const testRedirectOptions = () => {
  const options = ['origin', 'origin-slash', 'full-path', 'root-slash'];
  
  console.log('🔍 Testing Redirect URI Options:');
  options.forEach(option => {
    const { url, redirectUri } = createOAuthURL(option);
    console.log(`${option}: ${redirectUri}`);
    console.log(`URL: ${url.substring(0, 100)}...`);
    console.log('---');
  });
  
  return options.map(option => ({
    option,
    redirectUri: getRedirectURI(option),
    url: createOAuthURL(option).url
  }));
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = () => {
  const hash = window.location.hash;
  
  if (!hash) {
    return null;
  }
  
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
    throw new Error('Invalid state parameter');
  }
  
  localStorage.removeItem('oauth_state');
  
  if (idToken) {
    const userData = parseJWTToken(idToken);
    return userData;
  }
  
  return null;
};

/**
 * Parse JWT token
 */
const parseJWTToken = (token) => {
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
      verified: payload.email_verified
    };
  } catch (error) {
    throw new Error('Failed to parse JWT token: ' + error.message);
  }
};

/**
 * Generate random state
 */
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Store user data
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
  
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname);
  }
};