import express from "express";
import rateLimit from "express-rate-limit";
import authMiddleware from "./src/middleware/auth.js";
import { register, login } from "./src/controllers/auth.js";
import { listVMs, createVM, startVM, stopVM, deleteVM } from "./src/controllers/vm.js";
import {
  listSecurityGroups,
  createSecurityGroup,
  updateSecurityGroup,
  deleteSecurityGroup,
} from "./src/controllers/securityGroup.js";
import {
  listAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  executeJob,
} from "./src/controllers/aiAgent.js";

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

// Health check
router.get("/", (req, res) => res.json({ msg: "MyCloud API running" }));

// Auth routes (strict rate limiting)
router.post("/auth/register", authLimiter, register);
router.post("/auth/login", authLimiter, login);

// VM routes (protected + rate limited)
router.get("/vms", apiLimiter, authMiddleware, listVMs);
router.post("/vms", apiLimiter, authMiddleware, createVM);
router.post("/vms/:vmid/start", apiLimiter, authMiddleware, startVM);
router.post("/vms/:vmid/stop", apiLimiter, authMiddleware, stopVM);
router.delete("/vms/:vmid", apiLimiter, authMiddleware, deleteVM);

// Security group routes (protected + rate limited)
router.get("/security-groups", apiLimiter, authMiddleware, listSecurityGroups);
router.post("/security-groups", apiLimiter, authMiddleware, createSecurityGroup);
router.put("/security-groups/:id", apiLimiter, authMiddleware, updateSecurityGroup);
router.delete("/security-groups/:id", apiLimiter, authMiddleware, deleteSecurityGroup);

// AI agent routes (protected + rate limited)
router.get("/ai-agents", apiLimiter, authMiddleware, listAgents);
router.post("/ai-agents", apiLimiter, authMiddleware, createAgent);
router.put("/ai-agents/:id", apiLimiter, authMiddleware, updateAgent);
router.delete("/ai-agents/:id", apiLimiter, authMiddleware, deleteAgent);
router.post("/ai-agents/:id/execute", apiLimiter, authMiddleware, executeJob);

export default router;
