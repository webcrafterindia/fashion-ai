import React from 'react';
import './Hero.css';

function Hero({ onGoogleSignIn }) {
  return (
    <div className="hero-container">
      <div className="hero-background">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Your Personal
              <span className="hero-highlight"> Fashion AI</span>
              Assistant
            </h1>
            <p className="hero-subtitle">
              Transform your style with intelligent fashion recommendations.
              Get personalized outfit suggestions, style advice, and wardrobe
              management powered by advanced AI technology.
            </p>

            <div className="google-login-container">
              <button className="google-login-btn" onClick={onGoogleSignIn}>
                <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In with Google
              </button>
            </div>

            <div className="hero-features">
              <div className="feature">
                <div className="feature-icon">🤖</div>
                <div className="feature-text">
                  <h3>AI-Powered Styling</h3>
                  <p>Get intelligent outfit recommendations based on weather, occasion, and personal style</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">👗</div>
                <div className="feature-text">
                  <h3>Smart Wardrobe</h3>
                  <p>Organize your clothes digitally and discover new combinations you never thought of</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">💬</div>
                <div className="feature-text">
                  <h3>Style Chat</h3>
                  <p>Ask questions about fashion, get styling tips, and receive instant expert advice</p>
                </div>
              </div>
            </div>

            <div className="hero-cta">
              <button className="cta-secondary">
                Watch Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Outfits Created</span>
              </div>
              <div className="stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Satisfaction Rate</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone-mockup">
              <div className="phone-screen">
                <div className="app-preview">
                  <div className="preview-header">
                    <div className="preview-logo">StyleAI</div>
                    <div className="preview-weather">22° ⛅</div>
                  </div>

                  <div className="preview-message">
                    <div className="ai-avatar">🤖</div>
                    <div className="message-bubble">
                      Good morning! Based on today's weather, I suggest a light blazer with your favorite jeans. Perfect for that coffee meeting! ☀️
                    </div>
                  </div>

                  <div className="preview-outfits">
                    <div className="mini-outfit">
                      <div className="outfit-thumb">👔</div>
                      <span>Business Casual</span>
                    </div>
                    <div className="mini-outfit">
                      <div className="outfit-thumb">👗</div>
                      <span>Spring Look</span>
                    </div>
                    <div className="mini-outfit">
                      <div className="outfit-thumb">👕</div>
                      <span>Casual Friday</span>
                    </div>
                  </div>

                  <div className="preview-input">
                    <input placeholder="Ask me anything about style..." />
                    <button>💬</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-elements">
              <div className="floating-item item-1">✨</div>
              <div className="floating-item item-2">👠</div>
              <div className="floating-item item-3">🧥</div>
              <div className="floating-item item-4">💼</div>
              <div className="floating-item item-5">👓</div>
              <div className="floating-item item-6">⌚</div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="testimonial">
          <p>"FashionAI completely transformed how I approach my daily outfits. I save 30 minutes every morning and always look put-together!"</p>
          <div className="testimonial-author">
            <div className="author-avatar">👩</div>
            <div>
              <strong>Sarah Chen</strong>
              <span>Marketing Manager</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;