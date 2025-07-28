// src/components/Dashboard.jsx
import React from 'react';

function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 rounded shadow">CPU: 25%</div>
        <div className="p-4 bg-yellow-100 rounded shadow">Memory: 60%</div>
        <div className="p-4 bg-red-100 rounded shadow">Disk: 70%</div>
      </div>
    </div>
  );
}

export default Dashboard;