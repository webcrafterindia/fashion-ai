import { useState, useEffect, useCallback } from 'react';
import { 
  signInWithGooglePopup,
  storeUserData,
  getStoredUserData,
  clearUserData
} from '../lib/googleAuthSimple';

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
   * Initiate Google Sign-In
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await signInWithGooglePopup();
      
      // Store user data
      storeUserData(userData);
      setUser(userData);

    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
    } finally {
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
      
      // Sign out from Google (if available)
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
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