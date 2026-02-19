import { useState, useEffect } from "react";
import api from "../api";

const EMPTY_RULE = { direction: "inbound", protocol: "tcp", port: "80", cidr: "0.0.0.0/0", action: "allow", description: "" };

export default function SecurityGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", rules: [{ ...EMPTY_RULE }] });
  const [saving, setSaving] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/security-groups");
      setGroups(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load security groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this security group?")) return;
    try {
      await api.delete(`/security-groups/${id}`);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const handleRuleChange = (idx, field, value) => {
    const rules = [...form.rules];
    rules[idx] = { ...rules[idx], [field]: value };
    setForm({ ...form, rules });
  };

  const addRule = () => setForm({ ...form, rules: [...form.rules, { ...EMPTY_RULE }] });

  const removeRule = (idx) => setForm({ ...form, rules: form.rules.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/security-groups", form);
      setShowForm(false);
      setForm({ name: "", description: "", rules: [{ ...EMPTY_RULE }] });
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create security group");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Security Groups</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "+ New Group"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Security Group</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Group Name" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded p-2 w-full"
            />
            <input
              type="text" placeholder="Description (optional)" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded p-2 w-full"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rules</h3>
              {form.rules.map((rule, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center p-3 bg-gray-50 rounded">
                  <select value={rule.direction} onChange={(e) => handleRuleChange(idx, "direction", e.target.value)}
                    className="border rounded p-1 text-sm">
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                  <select value={rule.protocol} onChange={(e) => handleRuleChange(idx, "protocol", e.target.value)}
                    className="border rounded p-1 text-sm">
                    <option value="tcp">TCP</option>
                    <option value="udp">UDP</option>
                    <option value="icmp">ICMP</option>
                    <option value="all">All</option>
                  </select>
                  <input type="text" placeholder="Port" value={rule.port}
                    onChange={(e) => handleRuleChange(idx, "port", e.target.value)}
                    className="border rounded p-1 text-sm w-20" />
                  <input type="text" placeholder="CIDR" value={rule.cidr}
                    onChange={(e) => handleRuleChange(idx, "cidr", e.target.value)}
                    className="border rounded p-1 text-sm w-36" />
                  <select value={rule.action} onChange={(e) => handleRuleChange(idx, "action", e.target.value)}
                    className="border rounded p-1 text-sm">
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                  <input type="text" placeholder="Description" value={rule.description}
                    onChange={(e) => handleRuleChange(idx, "description", e.target.value)}
                    className="border rounded p-1 text-sm flex-1" />
                  <button type="button" onClick={() => removeRule(idx)}
                    className="text-red-500 hover:text-red-700 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={addRule}
                className="text-blue-600 text-sm hover:underline">+ Add Rule</button>
            </div>
            <button type="submit" disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">
              {saving ? "Saving…" : "Create Group"}
            </button>
          </form>
        </div>
      )}

      {loading && <p className="text-gray-500">Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white p-5 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
              </div>
              <button onClick={() => handleDelete(group._id)}
                className="text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>
            {group.rules.length === 0 ? (
              <p className="text-sm text-gray-400">No rules defined.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left">
                    {["Direction", "Protocol", "Port", "CIDR", "Action", "Description"].map((h) => (
                      <th key={h} className="py-1 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.rules.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1 pr-4 capitalize">{r.direction}</td>
                      <td className="py-1 pr-4 uppercase">{r.protocol}</td>
                      <td className="py-1 pr-4">{r.port}</td>
                      <td className="py-1 pr-4">{r.cidr}</td>
                      <td className={`py-1 pr-4 font-medium ${r.action === "allow" ? "text-green-600" : "text-red-500"}`}>
                        {r.action}
                      </td>
                      <td className="py-1 pr-4 text-gray-500">{r.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
        {!loading && groups.length === 0 && (
          <p className="text-gray-400 text-center py-8">No security groups yet. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}
