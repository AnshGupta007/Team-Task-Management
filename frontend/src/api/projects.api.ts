// ─── Projects API Functions ────────────────────────────────
import api from './axios';
import type { Project, ProjectMember, ActivityLog } from '../types';

export const projectsApi = {
  getAll: () =>
    api.get<{ projects: Project[] }>('/projects'),

  getById: (id: string) =>
    api.get<{ project: Project; userRole: string }>(`/projects/${id}`),

  create: (data: { name: string; description?: string; color?: string }) =>
    api.post<{ project: Project }>('/projects', data),

  update: (id: string, data: { name?: string; description?: string; color?: string }) =>
    api.put<{ project: Project }>(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  getMembers: (id: string) =>
    api.get<{ members: ProjectMember[] }>(`/projects/${id}/members`),

  addMember: (id: string, data: { email: string; role?: string }) =>
    api.post<{ member: ProjectMember }>(`/projects/${id}/members`, data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`),

  getActivity: (id: string, limit?: number) =>
    api.get<{ activities: ActivityLog[] }>(`/projects/${id}/activity`, {
      params: { limit: limit || 20 },
    }),
};
