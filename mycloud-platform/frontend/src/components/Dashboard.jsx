import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const Dashboard = () => {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vms")
      .then((res) => setVms(res.data || []))
      .catch(() => setVms([]))
      .finally(() => setLoading(false));
  }, []);

  const running = vms.filter((v) => v.status === "running").length;
  const totalCpu = vms.reduce((s, v) => s + (v.cpus || 0), 0);
  const totalRamMB = vms.reduce((s, v) => s + (v.maxmem ? Math.round(v.maxmem / 1024 / 1024) : 0), 0);
  const totalDiskGB = vms.reduce((s, v) => s + (v.maxdisk ? Math.round(v.maxdisk / 1024 / 1024 / 1024) : 0), 0);

  const cards = [
    { title: "Total VMs", value: loading ? "…" : vms.length },
    { title: "Running VMs", value: loading ? "…" : running },
    { title: "Total vCPUs", value: loading ? "…" : totalCpu },
    { title: "Total RAM Allocated", value: loading ? "…" : `${totalRamMB} MB` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">{card.title}</h2>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Virtual Machines</h2>
          <Link to="/vms" className="text-blue-600 text-sm hover:underline">View all →</Link>
        </div>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              {["VMID", "Name", "Status", "CPU", "RAM (MB)", "Disk (GB)"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-sm font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : vms.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                No VMs found. <Link to="/vms/create" className="text-blue-600 hover:underline">Create one</Link>
              </td></tr>
            ) : (
              vms.slice(0, 5).map((vm) => (
                <tr key={vm.vmid} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{vm.vmid}</td>
                  <td className="px-6 py-4">{vm.name || "—"}</td>
                  <td className={`px-6 py-4 font-medium ${vm.status === "running" ? "text-green-600" : "text-red-500"}`}>
                    {vm.status}
                  </td>
                  <td className="px-6 py-4">{vm.cpus || "—"}</td>
                  <td className="px-6 py-4">{vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024) : "—"}</td>
                  <td className="px-6 py-4">{vm.maxdisk ? Math.round(vm.maxdisk / 1024 / 1024 / 1024) : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/vms/create" className="block bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100">
              🖥 Create Virtual Machine
            </Link>
            <Link to="/security-groups" className="block bg-green-50 text-green-700 px-4 py-2 rounded hover:bg-green-100">
              🛡 Manage Security Groups
            </Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Storage Summary</h2>
          <p className="text-3xl font-bold">{loading ? "…" : `${totalDiskGB} GB`}</p>
          <p className="text-gray-500 text-sm mt-1">Total disk allocated across all VMs</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

