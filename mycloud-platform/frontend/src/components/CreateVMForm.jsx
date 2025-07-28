// src/components/CreateVMForm.jsx
import React from 'react';

function CreateVMForm() {
  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded-2xl shadow mb-4">
      <h2 className="text-xl font-semibold mb-2">Create New VM</h2>
      <input className="w-full p-2 border rounded mb-2" placeholder="VM Name" />
      <select className="w-full p-2 border rounded mb-2">
        <option>Ubuntu</option>
        <option>Debian</option>
        <option>CentOS</option>
      </select>
      <input className="w-full p-2 border rounded mb-2" type="number" placeholder="RAM (GB)" />
      <input className="w-full p-2 border rounded mb-2" type="number" placeholder="CPU Cores" />
      <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Create VM</button>
    </div>
  );
}

export default CreateVMForm;