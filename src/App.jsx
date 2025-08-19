import React from 'react';
import Hero from './Hero';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

function App() {
  const { user, loading, error, signInWithGoogle, signOut, isAuthenticated } = useSupabaseAuth();

  const handleRegister = () => {
    // This can be used for additional registration steps if needed
    // For now, Google auth is sufficient
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <div>Loading Fashion AI...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '18px', marginBottom: '15px' }}>Authentication Error</div>
          <div style={{ marginBottom: '20px', opacity: 0.9 }}>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show different views based on authentication status
  if (!isAuthenticated) {
    return (
<Hero onGoogleSignIn={signInWithGoogle} />
    );
  }

  // User is authenticated, show landing page
  return (
<LandingPage user={user} onSignOut={signOut} onRegister={handleRegister} />
  );
}

export default App;
