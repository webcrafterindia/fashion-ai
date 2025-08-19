import { useState, useEffect, useCallback } from 'react';
import { 
  redirectToGoogleAuth,
  handleOAuthCallback,
  isOAuthCallback,
  storeUserData,
  getStoredUserData,
  clearUserData
} from '../lib/googleAuthFixed';

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
        // Check if this is an OAuth callback
        if (isOAuthCallback()) {
          try {
            const userData = handleOAuthCallback();
            if (userData) {
              storeUserData(userData);
              setUser(userData);
              // Clear URL hash
              window.history.replaceState(null, null, window.location.pathname);
            }
          } catch (error) {
            console.error('OAuth callback error:', error);
            setError(error.message);
            // Clear URL hash on error
            window.history.replaceState(null, null, window.location.pathname);
          }
        } else {
          // Check for existing stored user data
          const storedUser = getStoredUserData();
          if (storedUser) {
            setUser(storedUser);
          }
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
   * Initiate Google Sign-In
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to Google OAuth
      redirectToGoogleAuth();
      
      // Note: The page will redirect, so this function won't complete
      // The user will be brought back to this page with auth tokens
      
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
      
      // Clear local storage and URL
      clearUserData();
      
      // Reset state
      setUser(null);
      setError(null);
      
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