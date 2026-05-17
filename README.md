# 🚀 TaskFlow — Team Task Management System

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A modern, full-stack team task management application with Kanban boards, real-time analytics, role-based access control, and a beautiful dark mode UI.**

[Live Demo](#) · [API Docs](#api-documentation) · [Setup Guide](#local-development-setup)

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
- **Node.js** v18+
- **PostgreSQL** running locally (or a cloud instance)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/AnshGupta007/team-task-manager.git
cd team-task-manager
```

### 2. Setup Backend
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string and JWT secrets

# Run database migrations
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Configure API URL (already set for localhost)
# Edit .env if your backend runs on a different port

# Start the development server
npm run dev
```

### 4. Open in Browser
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

### Step 1: Create a Railway Account
Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 2: Create PostgreSQL Database
1. Click **"New Project"** → **"Provision PostgreSQL"**
2. Copy the `DATABASE_URL` from the PostgreSQL service variables

### Step 3: Deploy Backend
1. Click **"New Service"** → **"GitHub Repo"** → Select your repo
2. Set root directory to `backend`
3. Add environment variables:
   - `DATABASE_URL` = (from step 2)
   - `JWT_SECRET` = (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `JWT_REFRESH_SECRET` = (generate another one)
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (your frontend URL, set after step 4)
4. Set build command: `npm run build && npx prisma migrate deploy`
5. Set start command: `npm start`

### Step 4: Deploy Frontend
1. Click **"New Service"** → **"GitHub Repo"** → Select your repo
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
4. Set build command: `npm run build`
5. Set start command: `npx serve dist -s -l 3000`

### Step 5: Update CORS
Go back to the backend service and update `FRONTEND_URL` to match your frontend's Railway URL.

---

## 👨‍💻 Author

**Ansh Gupta**

---

## 📄 License

This project is built for educational and assessment purposes.
