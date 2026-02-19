import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateVMForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", cores: 2, memory: 2048, disk: 20, ostype: "l26" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/vms", form);
      navigate("/vms");
    } catch (err) {
      setError(err.response?.data?.msg || "VM creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Create Virtual Machine</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VM Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. web-server-01"
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPU Cores</label>
            <input
              type="number" name="cores" value={form.cores} onChange={handleChange} min={1} max={64}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Memory (MB)</label>
            <input
              type="number" name="memory" value={form.memory} onChange={handleChange} min={512}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disk Size (GB)</label>
            <input
              type="number" name="disk" value={form.disk} onChange={handleChange} min={10}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OS Type</label>
            <select name="ostype" value={form.ostype} onChange={handleChange} className="border border-gray-300 rounded p-2 w-full">
              <option value="l26">Linux 5.x / 6.x (Kernel)</option>
              <option value="l24">Linux 2.4</option>
              <option value="win11">Windows 11</option>
              <option value="win10">Windows 10</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create VM"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/vms")}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

