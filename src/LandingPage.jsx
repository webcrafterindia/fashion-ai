import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';

function LandingPage({ onRegister }) {
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await supabase.from('profiles').insert([{ email, gender }]);
    onRegister();
  };

  return (
    <div style={{
      background: "url('/floating-fashion.png') no-repeat center center / cover",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1>Welcome to Fashion AI</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required />
        <select value={gender} onChange={e => setGender(e.target.value)} required>
          <option value="">Select gender</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">Get Started</button>
      </form>
    </div>
  );
}

export default LandingPage;
