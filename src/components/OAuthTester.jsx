import React, { useState } from 'react';
import { createOAuthURL, testRedirectOptions } from '../lib/googleAuthTest';

function OAuthTester() {
  const [selectedOption, setSelectedOption] = useState('origin');
  const [testResults, setTestResults] = useState([]);
  
  const redirectOptions = [
    { value: 'origin', label: 'Origin only (http://localhost:5000)', description: 'Most common' },
    { value: 'origin-slash', label: 'Origin with slash (http://localhost:5000/)', description: 'With trailing slash' },
    { value: 'full-path', label: 'Full path (http://localhost:5000/current/path)', description: 'Including current path' },
    { value: 'root-slash', label: 'Root with slash (http://localhost:5000/)', description: 'Always root path' }
  ];
  
  const handleTest = () => {
    const results = testRedirectOptions();
    setTestResults(results);
  };
  
  const handleTryAuth = () => {
    const { url, redirectUri } = createOAuthURL(selectedOption);
    console.log(`Trying OAuth with redirect URI: ${redirectUri}`);
    window.location.href = url;
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #667eea',
      borderRadius: '10px',
      padding: '20px',
      maxWidth: '350px',
      zIndex: 9999,
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#667eea' }}>🧪 OAuth Tester</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleTest}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Test All Options
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div style={{ 
          marginBottom: '15px', 
          background: '#f8fafc', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px'
        }}>
          <strong>Test Results:</strong>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginTop: '5px' }}>
              <strong>{result.option}:</strong> {result.redirectUri}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
          Try Different Redirect URI:
        </label>
        <select 
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '2px solid #e2e8f0',
            borderRadius: '5px',
            fontSize: '12px'
          }}
        >
          {redirectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
          {redirectOptions.find(opt => opt.value === selectedOption)?.description}
        </div>
      </div>
      
      <button 
        onClick={handleTryAuth}
        style={{
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          width: '100%'
        }}
      >
        🚀 Try This Option
      </button>
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '11px', 
        color: '#718096',
        background: '#fef3c7',
        padding: '8px',
        borderRadius: '5px'
      }}>
        💡 <strong>Tip:</strong> Try each option until one works. The exact URI must match your Google Console settings.
      </div>
    </div>
  );
}

export default OAuthTester;