import React, { useState } from 'react';
import { GOOGLE_CONFIG } from '../lib/googleAuthFixed';

function AuthDebug() {
  const [showDebug, setShowDebug] = useState(true);
  
  const currentUrl = window.location.href;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const clientId = GOOGLE_CONFIG.CLIENT_ID;
  const redirectUri = GOOGLE_CONFIG.REDIRECT_URI;
  
  // Create the actual OAuth URL that will be generated
  const state = 'debug-state-123';
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: state,
    nonce: 'debug-nonce-123'
  });
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 9999
        }}
      >
        Show Debug
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '11px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>🔍 OAuth Debug</h4>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div><strong>🌐 Current URL:</strong></div>
      <div style={{ color: '#90EE90', marginBottom: '8px', wordBreak: 'break-all' }}>{currentUrl}</div>
      
      <div><strong>🏠 Origin:</strong></div>
      <div style={{ color: '#87CEEB', marginBottom: '8px' }}>{origin}</div>
      
      <div><strong>📁 Pathname:</strong></div>
      <div style={{ color: '#87CEEB', marginBottom: '8px' }}>{pathname}</div>
      
      <div><strong>🆔 Client ID:</strong></div>
      <div style={{ color: '#FFB6C1', marginBottom: '8px', wordBreak: 'break-all' }}>{clientId}</div>
      
      <div><strong>↩️ Configured Redirect URI:</strong></div>
      <div style={{ color: '#FFA07A', marginBottom: '8px', wordBreak: 'break-all' }}>{redirectUri}</div>
      
      <div><strong>🔗 Generated OAuth URL:</strong></div>
      <div style={{ color: '#DDA0DD', marginBottom: '8px', wordBreak: 'break-all', fontSize: '10px' }}>
        {oauthUrl.substring(0, 100)}...
      </div>
      
      <div><strong>#️⃣ URL Hash:</strong></div>
      <div style={{ color: '#F0E68C', marginBottom: '8px' }}>{window.location.hash || 'none'}</div>
      
      <hr style={{ margin: '10px 0', borderColor: '#555' }} />
      
      <div style={{ fontSize: '10px', color: '#ccc' }}>
        <strong>✅ Add these to Google Cloud Console:</strong><br />
        <strong>Authorized JavaScript origins:</strong><br />
        • {origin}<br />
        <strong>Authorized redirect URIs:</strong><br />
        • {origin}<br />
        • {origin}/<br />
        {pathname !== '/' && `• ${origin}${pathname}`}
      </div>
      
      <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(255, 255, 0, 0.1)', borderRadius: '4px' }}>
        <strong>🚨 Common Issues:</strong><br />
        • URI must match exactly (no trailing slash differences)<br />
        • Use http:// for localhost, https:// for production<br />
        • Check for typos in Google Console
      </div>
    </div>
  );
}

export default AuthDebug;