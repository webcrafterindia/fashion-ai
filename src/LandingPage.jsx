import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import './LandingPage.css';

function LandingPage({ user, onSignOut, onRegister }) {
  const [gender, setGender] = useState('');
  const [activeTab, setActiveTab] = useState('suggestions');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      await supabase.from('profiles').insert([{ 
        email: user.email, 
        name: user.name,
        google_id: user.id,
        picture: user.picture,
        gender 
      }]);
      onRegister();
    }
  };

  const showTab = (tabName) => {
    setActiveTab(tabName);
  };

  const selectOutfit = (e) => {
    document.querySelectorAll('.outfit-card').forEach(c => {
      c.style.border = 'none';
    });
    e.currentTarget.style.border = '3px solid #667eea';
    e.currentTarget.style.transform = 'scale(1.02)';
    setTimeout(() => {
      alert('Great choice! This outfit has been added to your favorites. Would you like styling tips for accessories?');
    }, 300);
  };

  const uploadClothing = () => {
    alert('📸 Camera/Gallery would open here to upload clothing items. The AI would then analyze colors, patterns, and style to categorize items automatically.');
  };

  const sendMessage = () => {
    const input = document.getElementById('chatInput');
    const message = input?.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    setTimeout(() => {
      const responses = [
        "Great question! Navy pairs beautifully with white, cream, light gray, and even coral for a pop of color. Based on your wardrobe, I see you have a white tee that would look perfect with your navy blazer!",
        "For accessories with that outfit, I'd suggest a brown leather belt and matching shoes. A simple gold watch would complete the look perfectly. Check your accessories collection - you might already have these!",
        "For a formal event, I recommend your navy blazer with the white dress shirt and dark jeans, or if you need something more formal, the dark suit with a light blue shirt. Would you like me to show you specific combinations?",
        "I noticed you're asking about color coordination. Your wardrobe has a great foundation of neutrals! Would you like me to suggest some accent colors that would work well with your existing pieces?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'ai');
    }, 1000);
  };

  const addMessage = (text, sender) => {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-msg`;
    
    const avatar = sender === 'ai' ? '🤖' : '👤';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div className="message-avatar">${avatar}</div>
      <div className="message-content">
        <div className="message-text">${text}</div>
        <div className="message-time">${time}</div>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const askQuickQuestion = (question) => {
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = question;
      sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <header className="landing-header">
          <div className="header-content">
            <div className="landing-logo">StyleAI</div>
            <div className="user-info">
              {user && (
                <div className="user-profile">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="user-avatar"
                  />
                  <span className="user-name">{user.name}</span>
                  <button className="sign-out-btn" onClick={onSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <nav className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'suggestions' ? 'active' : ''}`}
                onClick={() => showTab('suggestions')}
              >AI Suggestions</button>
              <button 
                className={`nav-tab ${activeTab === 'wardrobe' ? 'active' : ''}`}
                onClick={() => showTab('wardrobe')}
              >My Wardrobe</button>
              <button 
                className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => showTab('analytics')}
              >Style Analytics</button>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div id="suggestions-content" className="content-panel ai-suggestions">
            {activeTab === 'suggestions' && (
              <>
                <div className="ai-message">
                  <div className="ai-message-avatar">🤖</div>
                  <h3>Good morning! ☀️</h3>
                  <p>Based on today's weather (22°C, partly cloudy) and your recent searches for "business casual spring outfits", I've curated some perfect looks from your wardrobe. These outfits combine pieces you love with trending styles!</p>
                </div>

                <div className="suggestions-grid">
                  {[
                    { emoji: '👔', title: 'Smart Casual Look', details: 'Navy blazer, white tee, dark jeans', confidence: '95%' },
                    { emoji: '👗', title: 'Spring Elegance', details: 'Floral midi dress, denim jacket', confidence: '88%' },
                    { emoji: '👕', title: 'Casual Friday', details: 'Checked shirt, chinos, loafers', confidence: '92%' },
                    { emoji: '🧥', title: 'Layered Look', details: 'Cardigan, striped tee, black pants', confidence: '85%' }
                  ].map((outfit, index) => (
                    <div key={index} className="outfit-card" onClick={selectOutfit}>
                      <div className="outfit-image">{outfit.emoji}</div>
                      <div className="outfit-info">
                        <div className="outfit-title">{outfit.title}</div>
                        <div className="outfit-details">{outfit.details}</div>
                        <div className="confidence-bar">
                          <div className="confidence-fill" style={{ width: outfit.confidence }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="action-buttons">
                  <button className="btn btn-primary">Generate New Suggestions</button>
                  <button className="btn btn-secondary">Refine Preferences</button>
                </div>

                <div className="chat-section">
                  <h3 className="section-title">Chat with StyleAI</h3>
                  <div className="chat-container">
                    <div className="chat-messages" id="chatMessages">
                      <div className="message ai-msg">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                          <div className="message-text">Hi! I'm here to help with your style questions. Ask me about outfit combinations, color matching, or styling tips!</div>
                          <div className="message-time">Just now</div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-input-container">
                      <input 
                        type="text" 
                        className="chat-input" 
                        placeholder="Ask me anything about styling..."
                        id="chatInput"
                        onKeyPress={handleKeyPress}
                      />
                      <button className="chat-send-btn" onClick={sendMessage}>
                        <span>📤</span>
                      </button>
                    </div>
                    <div className="quick-questions">
                      <span className="quick-q-label">Quick questions:</span>
                      {[
                        'What colors go with navy?',
                        'Suggest accessories',
                        'Formal event outfit'
                      ].map((question, index) => (
                        <button key={index} className="quick-q-btn" onClick={() => askQuickQuestion(question)}>
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'wardrobe' && (
              <>
                <h2 className="section-title">My Wardrobe</h2>
                <div className="upload-area" onClick={uploadClothing}>
                  <div className="upload-icon">📷</div>
                  <div><strong>Upload Your Clothes</strong></div>
                  <div className="upload-text">
                    Take photos of your clothes to build your digital wardrobe
                  </div>
                </div>
                <div className="suggestions-grid">
                  {[
                    { emoji: '👕', title: 'Blue Shirt', tag: 'Casual', season: 'All Season' },
                    { emoji: '👖', title: 'Dark Jeans', tag: 'Everyday', season: 'Fall/Winter' },
                    { emoji: '👗', title: 'Summer Dress', tag: 'Elegant', season: 'Spring/Summer' },
                    { emoji: '🧥', title: 'Blazer', tag: 'Business', season: 'All Season' },
                    { emoji: '👔', title: 'White Tee', tag: 'Relaxed', season: 'Spring/Summer' },
                    { emoji: '👠', title: 'Heels', tag: 'Formal', season: 'Formal Events' },
                    { emoji: '👟', title: 'Sneakers', tag: 'Athletic', season: 'Active Wear' },
                    { emoji: '🧳', title: 'Handbag', tag: 'Accessory', season: 'All Season' }
                  ].map((item, index) => (
                    <div key={index} className="outfit-card">
                      <div className="outfit-image">{item.emoji}</div>
                      <div className="outfit-info">
                        <div className="outfit-title">{item.title}</div>
                        <div className="outfit-details">
                          <span className="item-tag">{item.tag}</span>
                          <span className="item-season">{item.season}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <>
                <h2 className="section-title">Style Analytics</h2>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>Most Worn Colors</h3>
                    <div>
                      {[
                        { color: 'Navy Blue', percentage: '35%' },
                        { color: 'Black', percentage: '28%' },
                        { color: 'White', percentage: '22%' }
                      ].map((item, index) => (
                        <div key={index} className="analytics-item">
                          <span>{item.color}</span><span>{item.percentage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Style Preferences</h3>
                    <div>
                      {[
                        { style: 'Business Casual', percentage: '45%' },
                        { style: 'Casual', percentage: '35%' },
                        { style: 'Formal', percentage: '20%' }
                      ].map((item, index) => (
                        <div key={index} className="analytics-item">
                          <span>{item.style}</span><span>{item.percentage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="content-panel sidebar">
            <div className="weather-widget">
              <div className="weather-info">
                <div>
                  <div className="temp">22°</div>
                  <div>Partly Cloudy</div>
                </div>
                <div className="weather-icon">⛅</div>
              </div>
            </div>

            <div className="wardrobe-section">
              <h3 className="section-title">Wardrobe Overview</h3>
              <div className="wardrobe-stats">
                {[
                  { number: '47', label: 'Total Items' },
                  { number: '12', label: 'New This Month' },
                  { number: '8', label: 'Favorites' }
                ].map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="upload-area" onClick={uploadClothing}>
                <div className="upload-icon">📷</div>
                <div><strong>Add New Items</strong></div>
                <div className="upload-text">Drag photos or click to upload</div>
              </div>
            </div>

            <div className="recent-searches">
              <h3 className="section-title">Recent Searches</h3>
              {[
                { icon: '🔍', query: 'Business casual spring', time: '2 hours ago' },
                { icon: '💼', query: 'Interview outfits', time: 'Yesterday' },
                { icon: '🌟', query: 'Weekend casual', time: '3 days ago' },
                { icon: '🎉', query: 'Date night looks', time: '1 week ago' }
              ].map((search, index) => (
                <div key={index} className="search-item">
                  <div className="search-icon">{search.icon}</div>
                  <div className="search-content">
                    <div className="search-query">{search.query}</div>
                    <div className="search-time">{search.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </main>
      </div>

      <div className="registration-form">
        <h3 className="registration-title">Complete Profile Setup</h3>
        <div className="profile-info">
          {user && (
            <div className="welcome-message">
              <img src={user.picture} alt={user.name} className="profile-avatar" />
              <div>
                <div className="welcome-text">Welcome, {user.name}! 👋</div>
                <div className="email-text">{user.email}</div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <select 
            value={gender} 
            onChange={e => setGender(e.target.value)} 
            required
            className="form-input"
          >
            <option value="">Select your gender preference</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <button type="submit" className="submit-btn">Complete Setup</button>
        </form>
      </div>
    </div>
  );
}

export default LandingPage;