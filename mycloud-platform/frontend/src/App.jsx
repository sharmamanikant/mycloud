// src/App.jsx
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CreateVMForm from './components/CreateVMForm';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="text-2xl font-bold mb-4 text-center text-blue-700">
        ☁️ MyCloud Platform
      </header>

      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <Dashboard />
          <CreateVMForm />
        </>
      )}
    </div>
  );
}

export default App;
