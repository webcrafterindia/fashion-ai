import { useState, useEffect, useCallback } from 'react';
import {
  validateSession,
  handleGoogleAuthCallback,
  createGoogleOAuthURL,
  signOutUser,
  clearSession,
  logUserActivity,
  shouldRefreshSession
} from '../lib/supabaseAuth';

/**
 * Custom hook for Supabase authentication with Google OAuth
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check and validate existing session
   */
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionInfo = await validateSession();
      
      if (sessionInfo.isValid) {
        setUser(sessionInfo.user);
        setIsAuthenticated(true);
        
        // Log login activity
        await logUserActivity('login');
        
        // Check if session needs refresh
        if (sessionInfo.session.needsRefresh) {
          console.log('Session will expire soon - consider implementing refresh logic');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Session validation error:', err);
      setError(err.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle OAuth callback from Google
   */
  const handleOAuthCallback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const authResult = await handleGoogleAuthCallback();
      
      if (authResult) {
        setUser(authResult.user);
        setIsAuthenticated(true);
        
        // Log successful login
        await logUserActivity('login', {
          loginMethod: 'google_oauth',
          userAgent: navigator.userAgent
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err.message);
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initiate Google sign-in
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      const oauthUrl = createGoogleOAuthURL();
      
      // Redirect to Google OAuth
      window.location.href = oauthUrl;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log logout activity before signing out
      if (isAuthenticated) {
        await logUserActivity('logout');
      }
      
      const success = await signOutUser();
      
      if (success) {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      return success;
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const sessionInfo = await validateSession();
      
      if (sessionInfo.isValid) {
        setUser(sessionInfo.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(err.message);
    }
  }, [isAuthenticated]);

  /**
   * Check if session is about to expire
   */
  const checkSessionExpiry = useCallback(async () => {
    if (!isAuthenticated) return false;
    
    try {
      return await shouldRefreshSession();
    } catch (err) {
      console.error('Error checking session expiry:', err);
      return false;
    }
  }, [isAuthenticated]);

  /**
   * Clear any authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we're returning from OAuth
      const hasOAuthCallback = window.location.hash && (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('error')
      );

      if (hasOAuthCallback) {
        // Handle OAuth callback
        const success = await handleOAuthCallback();
        if (!success) {
          // If OAuth failed, still check for existing session
          await checkSession();
        }
      } else {
        // Check existing session
        await checkSession();
      }
    };

    initializeAuth();
  }, [checkSession, handleOAuthCallback]);

  // Set up session monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check session validity periodically
    const sessionCheckInterval = setInterval(async () => {
      try {
        const sessionInfo = await validateSession();
        if (!sessionInfo.isValid) {
          setUser(null);
          setIsAuthenticated(false);
          setError('Session expired. Please sign in again.');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [isAuthenticated]);

  // Set up activity logging
  useEffect(() => {
    if (!isAuthenticated) return;

    // Log activity on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logUserActivity('page_focus').catch(console.error);
      }
    };

    // Log activity on beforeunload
    const handleBeforeUnload = () => {
      logUserActivity('page_unload').catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated]);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    signInWithGoogle,
    signOut,
    refreshUser,
    clearError,
    
    // Utilities
    checkSessionExpiry,
    
    // Raw functions for advanced usage
    validateSession,
    logActivity: logUserActivity
  };
};

export default useSupabaseAuth;