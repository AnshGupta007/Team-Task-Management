// ─── Project Controller ────────────────────────────────────
// Handles CRUD for projects and member management

import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logActivity } from '../utils/activity.utils';

const prisma = new PrismaClient();

// Helper to safely extract string params
function param(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val;
}

/** GET /api/projects — Get all projects the user is a member of */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await prisma.task.groupBy({
          by: ['status'],
          where: { projectId: project.id },
          _count: true,
        });
        const stats = { total: 0, todo: 0, inProgress: 0, done: 0 };
        taskStats.forEach((s) => {
          stats.total += s._count;
          if (s.status === 'TODO') stats.todo = s._count;
          if (s.status === 'IN_PROGRESS') stats.inProgress = s._count;
          if (s.status === 'DONE') stats.done = s._count;
        });
        return { ...project, taskStats: stats };
      })
    );
    res.json({ projects: projectsWithStats });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

/** POST /api/projects — Create a new project */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, description, color } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        members: { create: { userId, role: Role.ADMIN } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });
    await logActivity(userId, project.id, 'PROJECT_CREATED', `Created project "${name}"`);
    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
}

/** GET /api/projects/:id — Get single project with tasks */
export async function getProject(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: id } },
    });
    if (!membership) {
      res.status(403).json({ message: 'You are not a member of this project' });
      return;
    }
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
            createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json({ project, userRole: membership.role });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
}

/** PUT /api/projects/:id — Update project (Admin only) */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;
    const { name, description, color } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
    });
    await logActivity(userId, id, 'PROJECT_UPDATED', `Updated project "${project.name}"`);
    res.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
}

/** DELETE /api/projects/:id — Delete project (Admin only) */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
}

/** POST /api/projects/:id/members — Add member by email */
export async function addMember(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;
    const { email, role } = req.body;
    const userToAdd = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!userToAdd) {
      res.status(404).json({ message: 'No user found with this email' });
      return;
    }
    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: userToAdd.id, projectId: id } },
    });
    if (existing) {
      res.status(409).json({ message: 'User is already a member' });
      return;
    }
    const member = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: id,
        role: role === 'ADMIN' ? Role.ADMIN : Role.MEMBER,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    await logActivity(userId, id, 'MEMBER_ADDED', `Added ${userToAdd.name}`);
    res.status(201).json({ member });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
}

/** DELETE /api/projects/:id/members/:userId — Remove member */
export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const memberUserId = param(req, 'userId');
    const currentUserId = req.user!.userId;
    if (memberUserId === currentUserId) {
      const adminCount = await prisma.projectMember.count({
        where: { projectId: id, role: Role.ADMIN },
      });
      if (adminCount <= 1) {
        res.status(400).json({ message: 'Cannot remove the only admin' });
        return;
      }
    }
    const removedUser = await prisma.user.findUnique({
      where: { id: memberUserId },
      select: { name: true },
    });
    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: memberUserId, projectId: id } },
    });
    await logActivity(currentUserId, id, 'MEMBER_REMOVED', `Removed ${removedUser?.name || 'member'}`);
    res.json({ message: 'Member removed' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
}

/** GET /api/projects/:id/members */
export async function getMembers(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });
    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
}

/** GET /api/projects/:id/activity */
export async function getActivityLog(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await prisma.activityLog.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ activities });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Failed to fetch activity log' });
  }
}
