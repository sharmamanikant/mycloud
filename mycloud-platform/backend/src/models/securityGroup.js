import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  direction: { type: String, enum: ["inbound", "outbound"], required: true },
  protocol: { type: String, enum: ["tcp", "udp", "icmp", "all"], default: "tcp" },
  port: { type: String, default: "any" },
  cidr: { type: String, default: "0.0.0.0/0" },
  action: { type: String, enum: ["allow", "deny"], default: "allow" },
  description: { type: String, default: "" },
});

const securityGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rules: [ruleSchema],
  },
  { timestamps: true }
);

export default mongoose.model("SecurityGroup", securityGroupSchema);
