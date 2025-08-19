// Supabase Authentication Integration
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that credentials are provided
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required in .env file');
}
if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Google OAuth configuration
 */
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '204501514447-i1rsq4br0oh872p803qth5loitagb1u6.apps.googleusercontent.com',
  SCOPE: 'openid email profile'
};

/**
 * Create or update user after Google sign-in
 */
export const createUserFromGoogle = async (googleUserData) => {
  try {
    const { data, error } = await supabase
      .rpc('create_user_from_google', {
        p_google_id: googleUserData.id,
        p_email: googleUserData.email,
        p_given_name: googleUserData.given_name || null,
        p_family_name: googleUserData.family_name || null,
        p_full_name: googleUserData.name || null,
        p_picture_url: googleUserData.picture || null,
        p_locale: googleUserData.locale || 'en'
      });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data; // Returns user_id
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Create user session
 */
export const createUserSession = async (userId, googleTokens = {}) => {
  try {
    const sessionToken = generateSessionToken();
    
    const { data, error } = await supabase
      .rpc('create_user_session', {
        p_user_id: userId,
        p_session_token: sessionToken,
        p_google_access_token: googleTokens.access_token || null,
        p_google_refresh_token: googleTokens.refresh_token || null,
        p_ip_address: null, // Could be obtained from a service
        p_user_agent: navigator.userAgent,
        p_device_info: JSON.stringify({
          platform: navigator.platform,
          language: navigator.language,
          screen: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

    if (error) {
      throw new Error(`Session creation error: ${error.message}`);
    }

    // Store session token locally
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('session_created_at', Date.now().toString());

    return {
      sessionId: data,
      sessionToken: sessionToken
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Validate current session
 */
export const validateSession = async (sessionToken = null) => {
  try {
    const token = sessionToken || localStorage.getItem('session_token');
    
    if (!token) {
      return { isValid: false, user: null };
    }

    const { data, error } = await supabase
      .rpc('validate_session', {
        p_session_token: token
      });

    if (error || !data || data.length === 0) {
      clearSession();
      return { isValid: false, user: null };
    }

    const sessionData = data[0];
    
    if (!sessionData.is_valid) {
      clearSession();
      return { isValid: false, user: null };
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*)
      `)
      .eq('id', sessionData.user_id)
      .single();

    if (userError || !userData) {
      clearSession();
      return { isValid: false, user: null };
    }

    return {
      isValid: true,
      user: {
        id: userData.id,
        email: userData.email,
        googleId: userData.google_id,
        profile: userData.user_profiles,
        lastLogin: userData.last_login,
        isActive: userData.is_active
      },
      session: {
        id: sessionData.session_id,
        needsRefresh: sessionData.needs_refresh
      }
    };
  } catch (error) {
    console.error('Error validating session:', error);
    clearSession();
    return { isValid: false, user: null };
  }
};

/**
 * Get user's complete profile
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*),
        user_preferences(*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Error fetching profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOutUser = async () => {
  try {
    const sessionToken = localStorage.getItem('session_token');
    
    if (sessionToken) {
      // Mark session as inactive in database
      await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
    }

    clearSession();
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    clearSession(); // Clear local session anyway
    return false;
  }
};

/**
 * Clear local session data
 */
export const clearSession = () => {
  localStorage.removeItem('session_token');
  localStorage.removeItem('session_created_at');
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth_timestamp');
  localStorage.removeItem('oauth_state');
  
  // Clear URL hash if present
  if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname);
  }
};

/**
 * Handle Google OAuth callback and create session
 */
export const handleGoogleAuthCallback = async () => {
  try {
    // Parse OAuth response from URL
    const hash = window.location.hash;
    if (!hash) return null;

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
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    localStorage.removeItem('oauth_state');

    if (!idToken) {
      throw new Error('No ID token received');
    }

    // Parse user data from JWT token
    const googleUserData = parseJWTToken(idToken);
    
    // Create or update user in database
    const userId = await createUserFromGoogle(googleUserData);
    
    // Create session
    const sessionInfo = await createUserSession(userId, {
      access_token: accessToken
    });

    // Clear URL hash
    window.history.replaceState(null, null, window.location.pathname);

    return {
      user: {
        id: userId,
        ...googleUserData
      },
      session: sessionInfo
    };
  } catch (error) {
    console.error('Error handling Google auth callback:', error);
    clearSession();
    throw error;
  }
};

/**
 * Generate OAuth URL
 */
export const createGoogleOAuthURL = () => {
  const redirectUri = window.location.origin;
  const state = generateSessionToken();
  
  localStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: GOOGLE_CONFIG.SCOPE,
    prompt: 'select_account',
    state: state,
    nonce: generateSessionToken()
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Log user activity
 */
export const logUserActivity = async (activityType, activityData = {}) => {
  try {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    // Get session info to get user_id and session_id
    const sessionInfo = await validateSession(sessionToken);
    if (!sessionInfo.isValid) return;

    await supabase
      .from('user_activities')
      .insert({
        user_id: sessionInfo.user.id,
        session_id: sessionInfo.session.id,
        activity_type: activityType,
        activity_data: activityData,
        ip_address: null, // Could be obtained from a service
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the app
  }
};

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Generate secure session token
 */
const generateSessionToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
      given_name: payload.given_name,
      family_name: payload.family_name,
      picture: payload.picture,
      locale: payload.locale,
      verified: payload.email_verified
    };
  } catch (error) {
    throw new Error('Failed to parse JWT token: ' + error.message);
  }
};

/**
 * Check if session needs refresh (within 7 days of expiry)
 */
export const shouldRefreshSession = async () => {
  const sessionToken = localStorage.getItem('session_token');
  if (!sessionToken) return false;

  try {
    const sessionInfo = await validateSession(sessionToken);
    return sessionInfo.isValid && sessionInfo.session.needsRefresh;
  } catch (error) {
    return false;
  }
};