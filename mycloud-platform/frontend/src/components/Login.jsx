// src/components/Login.jsx
import React from 'react';

function Login() {
  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-xl font-semibold mb-2">Login</h2>
      <input className="w-full p-2 border rounded mb-2" placeholder="Username" />
      <input className="w-full p-2 border rounded mb-2" type="password" placeholder="Password" />
      <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
    </div>
  );
}

export default Login;