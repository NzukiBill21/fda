// Temporary test component to verify React is working
import React from 'react';

export default function AppTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
      <h1>✅ REACT IS WORKING!</h1>
      <p>If you see this, React mounted successfully.</p>
      <p>Path: {window.location.pathname}</p>
      <p>Base: {window.location.origin}</p>
    </div>
  );
}

