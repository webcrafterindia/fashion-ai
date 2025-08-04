import React, { useState } from 'react';

function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    const response = await fetch('/functions/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    setMessages([...messages, { user: input, bot: data.reply }]);
    setInput('');
  };

  return (
    <div>
      <h2>Fashion Assistant Chat</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>You:</strong> {msg.user}</p>
            <p><strong>Bot:</strong> {msg.bot}</p>
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatPage;
