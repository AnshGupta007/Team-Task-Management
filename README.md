# 🚀 TaskFlow — Team Task Management System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern, full-stack team task management application with Kanban boards, real-time analytics, role-based access control, and a beautiful dark mode UI.**

[**Live Demo**](https://ansh-task-management-system.up.railway.app) · [API Docs](#api-documentation) · [Setup Guide](#local-development-setup)

</div>

---

## ✨ Features

### Core Functionality
- 🔐 **JWT Authentication** — Secure signup/login with access + refresh token rotation
- 📁 **Project Management** — Create, update, and organize team projects with color tags
- ✅ **Task Management** — Full CRUD with priority levels, due dates, and assignees
- 🎯 **Drag & Drop Kanban** — Visual task board with To Do → In Progress → Done columns
- 👥 **Team Collaboration** — Add/remove members by email with role-based permissions
- 🛡️ **Role-Based Access** — Admin (full control) and Member (view + update own tasks)

### Advanced Features
- 📊 **Analytics Dashboard** — Pie/bar charts for task distribution, progress tracking
- 🔔 **Activity Feed** — Real-time log of all project actions with timestamps
- 🔍 **Smart Filters** — Search tasks, filter by priority, status, and assignee
- 🌙 **Dark Mode** — Beautiful dark/light theme with OS preference detection
- ⏰ **Deadline Alerts** — Overdue (red) and due-soon (amber) task highlighting
- 📱 **Fully Responsive** — Mobile-first design that works on all devices
- 🔄 **Silent Token Refresh** — Seamless JWT refresh without user interruption

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **State Management** | TanStack React Query |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Drag & Drop** | @hello-pangea/dnd |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT (access + refresh tokens) |
| **Validation** | express-validator, Zod |
| **Security** | bcryptjs, helmet, CORS |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   └── dashboard.controller.ts
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/                 # API route definitions
│   │   ├── utils/                  # JWT & activity helpers
│   │   └── index.ts               # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                    # Axios API layer
│   │   ├── components/Layout/      # App layout & sidebar
│   │   ├── context/                # Auth & Theme providers
│   │   ├── pages/                  # Route pages
│   │   ├── types/                  # TypeScript definitions
│   │   ├── utils/                  # Helper functions
│   │   └── App.tsx                 # Main app with routing
│   ├── .env
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** v20.19+ (required by Vite 8)
- **PostgreSQL** running locally (or a cloud instance)
- **npm** or **yarn**

### 1. Clone & Setup
```bash
git clone https://github.com/AnshGupta007/team-task-manager.git
cd team-task-manager

# Install backend dependencies
cd backend
npm install

# Configure environment
# Create backend/.env with:
# DATABASE_URL=postgresql://user:pass@localhost:5432/task_manager?schema=public
# JWT_SECRET=<random-64-char-hex>
# JWT_REFRESH_SECRET=<random-64-char-hex>
# PORT=5000
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173

# Push Prisma schema to database
npx prisma db push

# Start backend dev server
npm run dev
```

### 2. Setup Frontend (separate terminal)
```bash
cd frontend
npm install

# Create frontend/.env with:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/taskflow` |
| `JWT_SECRET` | Secret key for access tokens | Random 64-char hex string |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | Random 64-char hex string |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/auth/me` | Get current user profile |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | List user's projects | Member |
| POST | `/api/projects` | Create project | Any user |
| GET | `/api/projects/:id` | Get project details | Member |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| GET | `/api/projects/:id/members` | List members | Member |
| POST | `/api/projects/:id/members` | Add member by email | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |
| GET | `/api/projects/:id/activity` | Get activity log | Member |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects/:id/tasks` | List project tasks | Member |
| POST | `/api/projects/:id/tasks` | Create task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin / Assigned |
| DELETE | `/api/tasks/:id` | Delete task | Admin |
| PATCH | `/api/tasks/:id/status` | Update task status | Admin / Assigned |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get aggregated statistics |

---

## 🚢 Deployment on Railway

This project uses a **single-service deployment** — the backend Express server builds and serves the frontend static files.

### Step 1: Create a Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 2: Create PostgreSQL Database
1. Click **"New Project"** → **"Provision PostgreSQL"**
2. Copy the `DATABASE_URL` from the PostgreSQL service variables

### Step 3: Deploy the App
1. Click **"New Service"** → **"GitHub Repo"** → Select your repo
2. Add environment variables:
   - `DATABASE_URL` = (from step 2)
   - `JWT_SECRET` = (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `JWT_REFRESH_SECRET` = (generate another one)
   - `NODE_ENV` = `production`
3. Railway auto-detects the root `package.json` and `railway.json`. Build runs `npm run build` (installs backend deps + builds TS). Start runs `npm start` (auto-creates DB tables via `prisma db push` then starts the Express server).
4. The app is available at `https://<your-project>.up.railway.app`

### Notes
- **Node version**: Forced via `railway.json` (`NIXPACKS_NODE_VERSION: "22"`) to meet Vite 8's requirement (Node ≥20.19). Clear build cache in Railway dashboard if version change isn't picked up.
- **Database**: Tables are auto-created on each start via `prisma db push --skip-generate`. No migration files are needed.
- **Healthcheck**: `/api/health` returns `{"status":"ok"}` — this endpoint is registered before auth middleware so it's always accessible.

---

## 👨‍💻 Author

**Ansh Gupta**

---

## 📄 License

This project is built for educational and assessment purposes.
