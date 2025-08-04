import React, { useState } from 'react';
import LandingPage from './LandingPage';
import ChatPage from './ChatPage';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);

  return (
    <div>
      {isRegistered ? (
        <ChatPage />
      ) : (
        <LandingPage onRegister={() => setIsRegistered(true)} />
      )}
    </div>
  );
}

export default App;
