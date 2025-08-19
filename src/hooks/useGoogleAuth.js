import { useState, useEffect, useCallback } from 'react';
import { 
  getGoogleAuthUrl, 
  exchangeCodeForToken, 
  getGoogleUserInfo,
  parseJWT,
  storeUserData,
  getStoredUserData,
  clearUserData
} from '../lib/googleAuth';

export const useGoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is returning from Google OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          setError(`Authentication error: ${error}`);
          setLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (code && state) {
          // Handle OAuth callback
          await handleOAuthCallback(code, state);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        // Check for existing stored user data
        const storedUser = getStoredUserData();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Handle OAuth callback from Google
   */
  const handleOAuthCallback = async (code, state) => {
    try {
      setLoading(true);
      setError(null);

      // Exchange code for tokens
      const tokenData = await exchangeCodeForToken(code, state);
      
      let userData;
      
      if (tokenData.id_token) {
        // Parse user info from ID token
        const idTokenPayload = parseJWT(tokenData.id_token);
        userData = {
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          name: idTokenPayload.name,
          picture: idTokenPayload.picture,
          verified: idTokenPayload.email_verified,
        };
      } else if (tokenData.access_token) {
        // Fallback: fetch user info using access token
        const userInfo = await getGoogleUserInfo(tokenData.access_token);
        userData = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          verified: userInfo.verified_email,
        };
      } else {
        throw new Error('No valid tokens received');
      }

      // Store user data
      storeUserData(userData);
      setUser(userData);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate Google Sign-In
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authUrl = getGoogleAuthUrl();
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear local storage
      clearUserData();
      
      // Reset state
      setUser(null);
      setError(null);
      
      // Optional: Revoke Google tokens (requires additional API call)
      // This would require storing the access token and making a revoke request
      
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user session
   */
  const refreshSession = useCallback(async () => {
    try {
      const storedUser = getStoredUserData();
      if (storedUser) {
        setUser(storedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      setError(error.message);
      return false;
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshSession,
    isAuthenticated: !!user
  };
};