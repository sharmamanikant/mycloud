# MyCloud Platform — Deployment Architecture

## Table of Contents
1. [Overview](#overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Component Descriptions](#component-descriptions)
4. [Security Architecture](#security-architecture)
5. [Scalability Design](#scalability-design)
6. [Reliability & High Availability](#reliability--high-availability)
7. [AI Agent Integration Architecture](#ai-agent-integration-architecture)
8. [What Still Needs to Be Implemented](#what-still-needs-to-be-implemented)

---

## Overview

MyCloud is a self-hosted cloud management platform that provides a web-based control plane over one or more Proxmox VE hypervisor nodes. It consists of:

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend API | Node.js 20 + Express |
| Database | MongoDB 7 |
| Hypervisor | Proxmox VE (managed via its REST API) |
| Containerisation | Docker + Docker Compose |
| Reverse Proxy | Nginx (recommended for production) |

---

## System Architecture Diagram

```
                              ┌─────────────────────────────────────────────────┐
                              │                 Internet / Users                 │
                              └────────────────────┬────────────────────────────┘
                                                   │ HTTPS :443
                              ┌────────────────────▼────────────────────────────┐
                              │            Nginx Reverse Proxy (TLS)            │
                              │  /          → frontend :3000                    │
                              │  /api/*     → backend  :5000                    │
                              └──────┬──────────────────────────┬───────────────┘
                                     │                          │
                     ┌───────────────▼────────┐   ┌────────────▼───────────────┐
                     │  React Frontend        │   │  Node.js / Express Backend │
                     │  (Docker container)    │   │  (Docker container)        │
                     │                        │   │  • JWT Auth                │
                     │  • Dashboard           │   │  • Rate limiting           │
                     │  • VM management       │   │  • VM routes (Proxmox)     │
                     │  • Security Groups     │   │  • Security Group routes   │
                     │  • AI Agents Console   │   │  • AI Agent routes         │
                     └────────────────────────┘   └────────────┬───────────────┘
                                                               │
                              ┌────────────────────────────────┼──────────────────────────────┐
                              │                                │                              │
                 ┌────────────▼──────────┐     ┌──────────────▼──────────┐  ┌───────────────▼────────────┐
                 │  MongoDB 7            │     │  Proxmox VE API         │  │  External AI Providers     │
                 │  (Docker container)   │     │  (HTTPS :8006)          │  │  • OpenAI                  │
                 │  • users              │     │  • List / create VMs    │  │  • Anthropic (Claude)      │
                 │  • aiagents           │     │  • Start / stop / delete│  │  • Google Gemini           │
                 │  • securitygroups     │     │    virtual machines     │  │  • Ollama (self-hosted)    │
                 └───────────────────────┘     └─────────────────────────┘  │  • Custom / OpenAI-compat  │
                                                                             └────────────────────────────┘
```

### Request Flow (VM creation example)

```
Browser → Nginx (TLS) → React frontend → (API call) → Nginx → Express backend
       → JWT validation → Rate limit check → Proxmox REST API → Proxmox node
       → Response bubbles back up the same chain
```

---

## Component Descriptions

### Nginx Reverse Proxy
- Terminates TLS with a Let's Encrypt or self-signed certificate
- Routes `/api/*` to the backend and everything else to the frontend SPA
- Adds security headers (`X-Frame-Options`, `X-Content-Type-Options`, HSTS)

### React Frontend
- Single-page application served as static files via Vite/Nginx
- Communicates exclusively through the `/api` prefix (no direct Proxmox access)
- `localStorage` token storage with `Authorization: Bearer <jwt>` on every request

### Express Backend
- Stateless JWT-authenticated REST API
- Per-route rate limiting (20 req/15 min for auth, 100 req/min for API)
- Mongoose ODM for MongoDB; bcryptjs for password hashing
- Proxmox client (`proxmox.js`) uses per-node API tokens (not root credentials)

### MongoDB
- Stores users, AI agent configurations, and security group definitions
- VM state is always read live from Proxmox (single source of truth)
- Run behind a Docker-internal network — not exposed to the internet

### Proxmox VE
- The actual hypervisor layer; MyCloud does not replace it
- Communicates via the Proxmox REST API using per-user API tokens
- `PROXMOX_TLS_VERIFY=true` must be set in production when using a valid cert

### AI Agent Service
- Configured per-user; API keys stored encrypted server-side, never returned to clients
- Supports OpenAI, Anthropic Claude, Google Gemini, Ollama (local), and any OpenAI-compatible endpoint
- Backend proxies all AI calls (prevents CORS issues and keeps keys off the client)

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Authentication | JWT (HS256, 8 h expiry); bcrypt password hashing (cost 10) |
| Authorisation | `authMiddleware` validates token on every protected route |
| Rate limiting | `express-rate-limit`; strict on `/auth/*`, relaxed on `/api/*` |
| Proxmox access | API token (not root password); TLS verify toggle |
| AI API keys | Stored server-side only; masked (`••••••••`) in all client responses |
| Transport | HTTPS via Nginx TLS termination in production |
| Database | MongoDB on Docker-internal network, not exposed externally |
| Secret management | All secrets via `.env` / `env_file`; `.env` is git-ignored |

### Recommendations for Production Hardening
1. **TLS everywhere** — set `PROXMOX_TLS_VERIFY=true` and use a valid certificate on the Proxmox host.
2. **Strong JWT secret** — generate with `openssl rand -hex 64` and rotate periodically.
3. **MongoDB authentication** — enable `--auth` and set `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD` in `docker-compose.yml`.
4. **Firewall** — expose only ports 80/443 externally; keep 5000 and 27017 on internal Docker network.
5. **Role-based access control (RBAC)** — extend the `role` field on the User model to restrict VM operations to admins (see §8).

---

## Scalability Design

### Horizontal Scaling (future)

```
Load Balancer (e.g. HAProxy / Nginx upstream)
        ├── Backend replica 1
        ├── Backend replica 2
        └── Backend replica N
                    │
              MongoDB Replica Set (or Atlas)
```

- The Express backend is stateless — scale by adding replicas behind a load balancer.
- Use a shared JWT secret across replicas (already environment-variable driven).
- Replace the single MongoDB container with a replica set or managed service (MongoDB Atlas) for persistence and read scaling.

### Caching
- Add Redis to cache Proxmox VM lists (high read frequency, low write frequency).
- Use Redis for rate-limit storage when running multiple backend replicas (`express-rate-limit` + `rate-limit-redis`).

### Multi-node Proxmox
- The `PROXMOX_NODE` environment variable already selects the active node.
- Extend the VM routes to accept a `node` query parameter to support a Proxmox cluster with multiple nodes.

---

## Reliability & High Availability

| Risk | Mitigation |
|---|---|
| Backend crash | Docker `restart: unless-stopped`; health check endpoint `/api/` |
| MongoDB data loss | Named Docker volume (`mongo_data`); regular `mongodump` backups |
| Proxmox API downtime | Graceful error responses from VM controllers; retry logic (future) |
| AI API failure | Backend returns `502` with detail; UI shows inline error in chat |
| Long JWT lifetime | Token expiry set to 8 h; implement refresh tokens for longer sessions |

### Recommended Additions
- **Docker health checks** on the backend container (`HEALTHCHECK CMD curl -f http://localhost:5000/api/ || exit 1`).
- **MongoDB backups** via a cron job running `mongodump` and uploading to object storage.
- **Uptime monitoring** with tools like UptimeRobot or Prometheus + Grafana.

---

## AI Agent Integration Architecture

The AI agent feature lets any authenticated user connect one or more AI providers (OpenAI, Anthropic, Gemini, Ollama, or any OpenAI-compatible API) to the Management Console and run natural-language jobs against them.

### Data flow

```
User (browser)
   │  POST /api/ai-agents/:id/execute  { prompt, systemPrompt }
   ▼
Express Backend  ─── looks up AIAgent doc from MongoDB (includes stored apiKey)
   │                  never returns apiKey to client
   ▼
AI Provider API  (OpenAI / Anthropic / Gemini / Ollama / Custom)
   │  { choices[0].message.content }  or equivalent
   ▼
Express Backend  ─── returns  { reply: "..." }
   ▼
Browser  ─── displays reply in chat UI
```

### Supported providers

| Provider | Auth | Default base URL |
|---|---|---|
| OpenAI | `Authorization: Bearer <key>` | `https://api.openai.com/v1/chat/completions` |
| Anthropic | `x-api-key: <key>` | `https://api.anthropic.com/v1/messages` |
| Google Gemini | `?key=<key>` query param | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |
| Ollama | none (local) | `http://localhost:11434/api/chat` |
| Custom | `Authorization: Bearer <key>` (optional) | user-supplied |

### Security considerations
- API keys are stored in MongoDB and **never sent back to the browser** (masked as `••••••••`).
- All AI calls are proxied through the backend so browser-side code never has access to keys.
- Add field-level encryption (e.g. `mongoose-field-encryption`) to the `apiKey` field for additional protection at rest.

---

## What Still Needs to Be Implemented

The following features are planned or recommended to make the platform production-ready:

### High Priority
- [ ] **RBAC** — Role enforcement on VM/agent routes (admin vs. user)
- [ ] **MongoDB authentication** — Enable auth in `docker-compose.yml`
- [ ] **AI API key encryption at rest** — `mongoose-field-encryption` or KMS
- [ ] **Docker health checks** for backend and frontend containers
- [ ] **Nginx configuration** — TLS termination, security headers, static frontend serving

### Medium Priority
- [ ] **Refresh tokens** — Replace 8 h JWT expiry with short-lived access + refresh token pair
- [ ] **Proxmox multi-node support** — Accept `node` param on VM routes for cluster environments
- [ ] **Backup & restore** — Automated `mongodump` + Proxmox VM snapshot scheduling
- [ ] **Networking page** — Virtual network / bridge management (Proxmox SDN)
- [ ] **Monitoring** — Prometheus metrics endpoint + Grafana dashboard

### Lower Priority
- [ ] **Audit log** — Record all user actions (VM create/delete, agent calls) in MongoDB
- [ ] **Multi-tenancy** — Namespace resources by organisation/team
- [ ] **Two-factor authentication (2FA)** — TOTP via `speakeasy` or a similar library
- [ ] **Websocket console** — In-browser VNC/SPICE access to Proxmox VMs
- [ ] **CI/CD pipeline** — GitHub Actions workflow for build, lint, test, and container push
