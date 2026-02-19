import { useState, useEffect } from "react";
import api from "../api";

const PROVIDERS = [
  { value: "openai", label: "OpenAI (ChatGPT)" },
  { value: "anthropic", label: "Anthropic (Claude)" },
  { value: "gemini", label: "Google Gemini" },
  { value: "ollama", label: "Ollama (Local)" },
  { value: "custom", label: "Custom / OpenAI-compatible" },
];

const DEFAULT_MODELS = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20241022",
  gemini: "gemini-1.5-pro",
  ollama: "llama3",
  custom: "gpt-4o",
};

const emptyForm = {
  name: "",
  provider: "openai",
  model: "gpt-4o",
  apiKey: "",
  baseUrl: "",
  description: "",
};

export default function AIAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Chat / job runner state
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [running, setRunning] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai-agents");
      setAgents(res.data || []);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load AI agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const openCreate = () => {
    setEditAgent(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (agent) => {
    setEditAgent(agent);
    setForm({
      name: agent.name,
      provider: agent.provider,
      model: agent.model,
      apiKey: "",
      baseUrl: agent.baseUrl || "",
      description: agent.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const handleProviderChange = (provider) => {
    setForm((f) => ({ ...f, provider, model: DEFAULT_MODELS[provider] || "" }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editAgent) {
        await api.put(`/ai-agents/${editAgent._id}`, form);
      } else {
        await api.post("/ai-agents", form);
      }
      setShowForm(false);
      fetchAgents();
    } catch (err) {
      setFormError(err.response?.data?.msg || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this AI agent?")) return;
    try {
      await api.delete(`/ai-agents/${id}`);
      if (selectedAgent?._id === id) setSelectedAgent(null);
      fetchAgents();
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedAgent) return;
    const userMsg = prompt.trim();
    setPrompt("");
    setChatHistory((h) => [...h, { role: "user", content: userMsg }]);
    setRunning(true);
    try {
      const res = await api.post(`/ai-agents/${selectedAgent._id}/execute`, {
        prompt: userMsg,
        systemPrompt: systemPrompt.trim() || undefined,
      });
      setChatHistory((h) => [...h, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      const msg = err.response?.data?.msg || "Agent execution failed";
      setChatHistory((h) => [...h, { role: "error", content: msg }]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Agents</h1>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Connect AI Agent
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Agent list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <p className="text-gray-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <div className="col-span-3 bg-white rounded-lg shadow p-8 text-center text-gray-400">
            No AI agents connected yet. Click <strong>+ Connect AI Agent</strong> to get started.
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent._id}
              className={`bg-white rounded-lg shadow p-5 cursor-pointer border-2 transition ${
                selectedAgent?._id === agent._id
                  ? "border-blue-500"
                  : "border-transparent hover:border-blue-200"
              }`}
              onClick={() => {
                setSelectedAgent(agent);
                setChatHistory([]);
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {PROVIDERS.find((p) => p.value === agent.provider)?.label || agent.provider}
                    {" · "}
                    {agent.model}
                  </p>
                  {agent.description && (
                    <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(agent); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(agent._id); }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat / Job console */}
      {selectedAgent && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">
              Run Job · <span className="text-blue-600">{selectedAgent.name}</span>
            </h2>
          </div>

          <div className="px-6 py-3 border-b">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              System Prompt <span className="font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful cloud infrastructure assistant…"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Chat history */}
          <div className="px-6 py-4 space-y-3 min-h-[180px] max-h-[420px] overflow-y-auto">
            {chatHistory.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-8">
                Send a prompt to run a job on this agent.
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-50 text-blue-900 ml-12"
                    : msg.role === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-800 mr-12"
                }`}
              >
                <span className="font-medium block mb-1">
                  {msg.role === "user" ? "You" : msg.role === "error" ? "Error" : selectedAgent.name}
                </span>
                {msg.content}
              </div>
            ))}
            {running && (
              <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-400 mr-12">
                Thinking…
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleExecute} className="px-6 py-4 border-t flex gap-3">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleExecute(e); }
              }}
              placeholder="Enter a prompt or management job… (Enter to send, Shift+Enter for new line)"
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              disabled={running}
            />
            <button
              type="submit"
              disabled={running || !prompt.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 self-end"
            >
              {running ? "…" : "Send"}
            </button>
          </form>
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b font-semibold text-lg">
              {editAgent ? "Edit AI Agent" : "Connect AI Agent"}
            </div>
            <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="My OpenAI Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                <select
                  value={form.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <input
                  required
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="e.g. gpt-4o"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key{form.provider === "ollama" ? " (not required for Ollama)" : " *"}
                </label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder={editAgent ? "Leave blank to keep existing key" : "sk-…"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL <span className="font-normal text-gray-400">(optional — override default endpoint)</span>
                </label>
                <input
                  value={form.baseUrl}
                  onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving…" : editAgent ? "Update" : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
