import mongoose from "mongoose";

const aiAgentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ["openai", "anthropic", "gemini", "ollama", "custom"],
      required: true,
    },
    model: { type: String, required: true, trim: true },
    apiKey: { type: String, default: "" },
    baseUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AIAgent", aiAgentSchema);
