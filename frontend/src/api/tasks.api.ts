// ─── Tasks API Functions ───────────────────────────────────
import api from './axios';
import type { Task, DashboardStats, ActivityLog } from '../types';

export const tasksApi = {
  getByProject: (projectId: string, filters?: Record<string, string>) =>
    api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`, { params: filters }),

  create: (projectId: string, data: {
    title: string; description?: string;
    priority?: string; dueDate?: string; assignedToId?: string;
  }) =>
    api.post<{ task: Task }>(`/projects/${projectId}/tasks`, data),

  update: (taskId: string, data: Partial<Task>) =>
    api.put<{ task: Task }>(`/tasks/${taskId}`, data),

  delete: (taskId: string) =>
    api.delete(`/tasks/${taskId}`),

  updateStatus: (taskId: string, status: string) =>
    api.patch<{ task: Task }>(`/tasks/${taskId}/status`, { status }),
};

export const dashboardApi = {
  getStats: () =>
    api.get<{ stats: DashboardStats; recentActivity: ActivityLog[] }>('/dashboard/stats'),
};
