// src/components/Dashboard.jsx
import React from 'react';

function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // or use state if routing is added
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name}</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
