// Simplified Google OAuth for Frontend Apps
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com',
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  SCOPE: 'openid email profile'
};

/**
 * Initialize Google Sign-In
 */
export const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    // Check if Google API is already loaded
    if (window.google && window.google.accounts) {
      resolve(window.google);
      return;
    }

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.accounts) {
        resolve(window.google);
      } else {
        reject(new Error('Failed to load Google API'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google API script'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Handle Google Sign-In with popup
 */
export const signInWithGooglePopup = async () => {
  try {
    const google = await initializeGoogleSignIn();
    
    return new Promise((resolve, reject) => {
      google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.CLIENT_ID,
        callback: (response) => {
          try {
            // Decode the JWT ID token
            const userData = parseJWTToken(response.credential);
            resolve(userData);
          } catch (error) {
            reject(error);
          }
        },
        error_callback: (error) => {
          reject(new Error('Google Sign-In failed: ' + error.type));
        }
      });

      // Display the One Tap UI
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to manual sign-in button
          console.log('One Tap not available, using manual sign-in');
        }
      });

      // Also set up manual sign-in button as fallback
      const signInButton = document.createElement('div');
      signInButton.style.display = 'none';
      document.body.appendChild(signInButton);
      
      google.accounts.id.renderButton(signInButton, {
        theme: 'outline',
        size: 'large',
        click_listener: () => {
          google.accounts.id.prompt();
        }
      });
      
      // Auto-click the button to trigger sign-in
      setTimeout(() => {
        signInButton.click();
        document.body.removeChild(signInButton);
      }, 100);
    });
  } catch (error) {
    throw new Error('Failed to initialize Google Sign-In: ' + error.message);
  }
};

/**
 * Alternative: Use OAuth 2.0 popup flow
 */
export const signInWithGoogleOAuth = () => {
  return new Promise((resolve, reject) => {
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.CLIENT_ID,
      redirect_uri: GOOGLE_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_CONFIG.SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Open popup window
    const popup = window.open(
      authUrl,
      'google-signin',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      reject(new Error('Popup blocked - please allow popups for this site'));
      return;
    }
    
    // Monitor popup for completion
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Check if we got the auth code in localStorage (set by the callback)
        const authResult = localStorage.getItem('google_auth_result');
        if (authResult) {
          const result = JSON.parse(authResult);
          localStorage.removeItem('google_auth_result');
          resolve(result);
        } else {
          reject(new Error('Authentication cancelled or failed'));
        }
      }
    }, 1000);
  });
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
 * Clear user data
 */
export const clearUserData = () => {
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth_timestamp');
  localStorage.removeItem('oauth_state');
  localStorage.removeItem('google_auth_result');
};