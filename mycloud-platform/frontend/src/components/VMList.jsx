import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function VMList() {
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVMs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vms");
      setVms(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load VMs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVMs();
  }, []);

  const handleAction = async (vmid, action) => {
    try {
      await api.post(`/vms/${vmid}/${action}`);
      fetchVMs();
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDelete = async (vmid) => {
    if (!window.confirm(`Delete VM ${vmid}?`)) return;
    try {
      await api.delete(`/vms/${vmid}`);
      fetchVMs();
    } catch (err) {
      alert(`Delete failed: ${err.response?.data?.msg || err.message}`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Virtual Machines</h1>
        <Link to="/vms/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Create VM
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading VMs…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                {["VMID", "Name", "Status", "CPU", "RAM (MB)", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-sm font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No VMs found. Create your first VM!
                  </td>
                </tr>
              ) : (
                vms.map((vm) => (
                  <tr key={vm.vmid} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{vm.vmid}</td>
                    <td className="px-6 py-4">{vm.name || "—"}</td>
                    <td className={`px-6 py-4 font-medium ${vm.status === "running" ? "text-green-600" : "text-red-500"}`}>
                      {vm.status}
                    </td>
                    <td className="px-6 py-4">{vm.cpus || "—"}</td>
                    <td className="px-6 py-4">{vm.maxmem ? Math.round(vm.maxmem / 1024 / 1024) : "—"}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {vm.status !== "running" && (
                        <button
                          onClick={() => handleAction(vm.vmid, "start")}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Start
                        </button>
                      )}
                      {vm.status === "running" && (
                        <button
                          onClick={() => handleAction(vm.vmid, "stop")}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Stop
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(vm.vmid)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
