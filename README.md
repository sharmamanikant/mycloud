# MyCloud

A self-hosted cloud management platform that provides a web-based control plane over Proxmox VE hypervisors — with built-in AI Agent integration for intelligent infrastructure management.

## Features

- 🖥 **Virtual Machine management** — create, start, stop, and delete VMs on Proxmox VE
- 🛡 **Security Groups** — define inbound/outbound firewall rules per user
- 🤖 **AI Agents Console** — connect OpenAI, Anthropic Claude, Google Gemini, Ollama, or any OpenAI-compatible AI to perform management jobs
- 🔒 **Secure by default** — JWT authentication, bcrypt password hashing, per-route rate limiting
- 🐳 **Docker Compose** — single-command local and production deployment

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full deployment architecture, security design, scalability plan, and roadmap.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · Vite · Tailwind CSS |
| Backend | Node.js 20 · Express · Mongoose |
| Database | MongoDB 7 |
| Hypervisor | Proxmox VE (REST API) |
| Containers | Docker · Docker Compose |

---

## Prerequisites

| Requirement | Version |
|---|---|
| Docker | 24+ |
| Docker Compose | 2.20+ |
| Node.js (dev only) | 20+ |
| Proxmox VE | 7 or 8 |

---

## Quick Start (Docker Compose)

### 1. Clone the repository

```bash
git clone https://github.com/sharmamanikant/mycloud.git
cd mycloud/mycloud-platform
```

### 2. Configure the environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000

# Proxmox VE connection
PROXMOX_API_URL=https://<proxmox-host>:8006/api2/json
PROXMOX_USER=root@pam
PROXMOX_TOKEN_ID=<your-token-id>
PROXMOX_SECRET=<your-api-token-secret>
PROXMOX_NODE=pve
PROXMOX_TLS_VERIFY=false        # set to true in production with a valid cert

# JWT — generate with: openssl rand -hex 64
JWT_SECRET=change-this-to-a-long-random-secret

# MongoDB (set automatically by docker-compose)
MONGODB_URI=mongodb://mongodb:27017/mycloud
```

### 3. Build and start all services

```bash
docker compose up --build -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| MongoDB | localhost:27017 (internal) |

### 4. Create your first account

Open http://localhost:3000 → **Register** → fill in name, email, and password.

---

## Development (without Docker)

### Backend

```bash
cd mycloud-platform/backend
cp .env.example .env          # edit as above, set MONGODB_URI=mongodb://localhost:27017/mycloud
npm install
npm run dev                   # starts with --watch (hot reload)
```

### Frontend

```bash
cd mycloud-platform/frontend
npm install
npm run dev                   # Vite dev server on http://localhost:5173
```

Create `mycloud-platform/frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login; returns JWT |

### Virtual Machines

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vms` | List all VMs from Proxmox |
| `POST` | `/api/vms` | Create a new VM |
| `POST` | `/api/vms/:vmid/start` | Start a VM |
| `POST` | `/api/vms/:vmid/stop` | Stop a VM |
| `DELETE` | `/api/vms/:vmid` | Delete a VM |

### Security Groups

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/security-groups` | List user's security groups |
| `POST` | `/api/security-groups` | Create a security group |
| `PUT` | `/api/security-groups/:id` | Update a security group |
| `DELETE` | `/api/security-groups/:id` | Delete a security group |

### AI Agents

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai-agents` | List configured AI agents |
| `POST` | `/api/ai-agents` | Connect a new AI agent |
| `PUT` | `/api/ai-agents/:id` | Update an AI agent |
| `DELETE` | `/api/ai-agents/:id` | Remove an AI agent |
| `POST` | `/api/ai-agents/:id/execute` | Run a job (prompt) on the agent |

**Execute body:**
```json
{
  "prompt": "List all stopped VMs and suggest when to delete them",
  "systemPrompt": "You are a helpful cloud infrastructure assistant."
}
```

---

## Connecting an AI Agent

1. Navigate to **AI Agents** in the sidebar.
2. Click **+ Connect AI Agent**.
3. Choose a provider and fill in the details:

| Provider | Required fields |
|---|---|
| OpenAI (ChatGPT) | API key, Model (e.g. `gpt-4o`) |
| Anthropic (Claude) | API key, Model (e.g. `claude-3-5-sonnet-20241022`) |
| Google Gemini | API key, Model (e.g. `gemini-1.5-pro`) |
| Ollama (local) | Base URL (e.g. `http://ollama:11434`), Model (e.g. `llama3`) |
| Custom | Base URL (OpenAI-compatible endpoint), optional API key |

4. Click the agent card to select it.
5. Optionally set a **System Prompt** (e.g. "You are a cloud infrastructure assistant").
6. Type your management job in the chat box and press **Enter** (or **Send**).

API keys are stored server-side only and are never returned to the browser.

---

## Production Deployment

### Nginx + TLS (recommended)

Install Nginx and Certbot on your host. Example site config:

```nginx
server {
    listen 443 ssl;
    server_name mycloud.example.com;

    ssl_certificate     /etc/letsencrypt/live/mycloud.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mycloud.example.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

server {
    listen 80;
    server_name mycloud.example.com;
    return 301 https://$host$request_uri;
}
```

### Security checklist for production

- [ ] Set `PROXMOX_TLS_VERIFY=true` and use a valid certificate on Proxmox
- [ ] Generate a strong `JWT_SECRET` (`openssl rand -hex 64`)
- [ ] Enable MongoDB authentication in `docker-compose.yml`
- [ ] Close ports 5000 and 27017 in your firewall; only expose 80/443
- [ ] Set `NODE_ENV=production` in the frontend container

---

## Architecture

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for:

- Full system architecture diagram
- Security design
- Scalability and high-availability plan
- AI agent data flow
- Complete roadmap of what still needs to be built

---

## Project Structure

```
mycloud-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.js          # register / login
│   │   │   ├── vm.js            # Proxmox VM operations
│   │   │   ├── securityGroup.js # security group CRUD
│   │   │   └── aiAgent.js       # AI agent CRUD + execute
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT auth middleware
│   │   └── models/
│   │       ├── user.js
│   │       ├── securityGroup.js
│   │       └── aiAgent.js       # AI agent config model
│   ├── proxmox.js               # Proxmox REST client
│   ├── routes.js                # All API routes
│   ├── index.js                 # Express app entry point
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── VMList.jsx
│   │   │   ├── CreateVMForm.jsx
│   │   │   ├── SecurityGroups.jsx
│   │   │   ├── AIAgents.jsx     # AI agent management + chat console
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js               # Axios instance with JWT interceptor
│   │   ├── App.jsx              # Routes
│   │   └── index.jsx
│   └── Dockerfile
├── docker-compose.yml
└── docs/
    └── ARCHITECTURE.md          # Deployment architecture & roadmap
```

---

## License

MIT
