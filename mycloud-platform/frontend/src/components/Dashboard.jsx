// components/Dashboard.jsx
import React from "react";

const cards = [
  { title: "Active VMs", value: 12 },
  { title: "CPU Usage", value: "65%" },
  { title: "RAM Usage", value: "32GB / 64GB" },
  { title: "Storage Used", value: "1.2TB / 5TB" },
];

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-500">{card.title}</h2>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* VM Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                CPU
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                RAM
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Storage
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "VM-1", status: "Running", cpu: "4 vCPU", ram: "8GB", storage: "100GB" },
              { name: "VM-2", status: "Stopped", cpu: "2 vCPU", ram: "4GB", storage: "50GB" },
            ].map((vm, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{vm.name}</td>
                <td className={`px-6 py-4 ${vm.status === "Running" ? "text-green-500" : "text-red-500"}`}>{vm.status}</td>
                <td className="px-6 py-4">{vm.cpu}</td>
                <td className="px-6 py-4">{vm.ram}</td>
                <td className="px-6 py-4">{vm.storage}</td>
                <td className="px-6 py-4">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Start</button>
                  <button className="bg-gray-300 text-black px-3 py-1 rounded">Stop</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
