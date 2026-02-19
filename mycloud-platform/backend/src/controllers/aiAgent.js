import axios from "axios";
import AIAgent from "../models/aiAgent.js";

// Strip the stored API key from the response sent to the client
const sanitize = (doc) => {
  const obj = doc.toObject();
  if (obj.apiKey) obj.apiKey = "••••••••";
  return obj;
};

export const listAgents = async (req, res) => {
  try {
    const agents = await AIAgent.find({ owner: req.user.id });
    res.json(agents.map(sanitize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching AI agents" });
  }
};

export const createAgent = async (req, res) => {
  try {
    const { name, provider, model, apiKey, baseUrl, description } = req.body;
    const agent = await AIAgent.create({
      name,
      provider,
      model,
      apiKey: apiKey || "",
      baseUrl: baseUrl || "",
      description: description || "",
      owner: req.user.id,
    });
    res.status(201).json(sanitize(agent));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating AI agent" });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { name, provider, model, apiKey, baseUrl, description } = req.body;
    const update = { name, provider, model, baseUrl, description };
    // Only overwrite the stored key if a new non-masked value is provided
    if (apiKey && !apiKey.startsWith("••")) update.apiKey = apiKey;

    const agent = await AIAgent.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      update,
      { new: true, runValidators: true }
    );
    if (!agent) return res.status(404).json({ msg: "AI agent not found" });
    res.json(sanitize(agent));
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating AI agent" });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await AIAgent.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!agent) return res.status(404).json({ msg: "AI agent not found" });
    res.json({ msg: "AI agent deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error deleting AI agent" });
  }
};

// Execute a job (prompt) using the configured AI agent
export const executeJob = async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;
    if (!prompt) return res.status(400).json({ msg: "prompt is required" });

    const agent = await AIAgent.findOne({ _id: req.params.id, owner: req.user.id });
    if (!agent) return res.status(404).json({ msg: "AI agent not found" });

    let reply = "";

    switch (agent.provider) {
      case "openai": {
        const url = agent.baseUrl || "https://api.openai.com/v1/chat/completions";
        const response = await axios.post(
          url,
          {
            model: agent.model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
          },
          { headers: { Authorization: `Bearer ${agent.apiKey}`, "Content-Type": "application/json" } }
        );
        reply = response.data.choices?.[0]?.message?.content || "";
        break;
      }

      case "anthropic": {
        const url = agent.baseUrl || "https://api.anthropic.com/v1/messages";
        const response = await axios.post(
          url,
          {
            model: agent.model,
            max_tokens: 4096,
            ...(systemPrompt ? { system: systemPrompt } : {}),
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "x-api-key": agent.apiKey,
              "anthropic-version": process.env.ANTHROPIC_API_VERSION || "2023-06-01",
              "Content-Type": "application/json",
            },
          }
        );
        reply = response.data.content?.[0]?.text || "";
        break;
      }

      case "gemini": {
        const baseUrl =
          agent.baseUrl ||
          `https://generativelanguage.googleapis.com/v1beta/models/${agent.model}:generateContent`;
        const response = await axios.post(
          `${baseUrl}?key=${agent.apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
            ...(systemPrompt
              ? { systemInstruction: { parts: [{ text: systemPrompt }] } }
              : {}),
          },
          { headers: { "Content-Type": "application/json" } }
        );
        reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        break;
      }

      case "ollama": {
        const url = (agent.baseUrl || "http://localhost:11434") + "/api/chat";
        const response = await axios.post(
          url,
          {
            model: agent.model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
            stream: false,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        reply = response.data.message?.content || "";
        break;
      }

      case "custom": {
        if (!agent.baseUrl) return res.status(400).json({ msg: "baseUrl required for custom provider" });
        const response = await axios.post(
          agent.baseUrl,
          {
            model: agent.model,
            messages: [
              ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
              { role: "user", content: prompt },
            ],
          },
          {
            headers: {
              ...(agent.apiKey ? { Authorization: `Bearer ${agent.apiKey}` } : {}),
              "Content-Type": "application/json",
            },
          }
        );
        reply =
          response.data.choices?.[0]?.message?.content ||
          response.data.message?.content ||
          response.data.reply ||
          JSON.stringify(response.data);
        break;
      }

      default:
        return res.status(400).json({ msg: `Unsupported provider: ${agent.provider}` });
    }

    res.json({ reply });
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error("AI agent execute error:", detail);
    res.status(502).json({ msg: "Error communicating with AI agent", detail });
  }
};
