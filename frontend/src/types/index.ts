// ─── TypeScript Type Definitions ───────────────────────────
// Shared types used throughout the frontend application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  members: ProjectMember[];
  _count?: { tasks: number };
  taskStats?: TaskStats;
}

export interface ProjectMember {
  id: string;
  role: 'ADMIN' | 'MEMBER';
  userId: string;
  projectId: string;
  joinedAt: string;
  user: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  projectId: string;
  assignedToId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: User | null;
  createdBy: User;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  userId: string;
  projectId: string;
  createdAt: string;
  user: User;
  project?: { id: string; name: string; color: string };
}

export interface DashboardStats {
  totalTasks: number;
  totalProjects: number;
  overdueTasks: number;
  dueSoonTasks: number;
  myTasks: number;
  tasksByStatus: {
    todo: number;
    inProgress: number;
    done: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  tasksPerMember: {
    userId: string;
    name: string;
    avatar: string;
    count: number;
  }[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}
