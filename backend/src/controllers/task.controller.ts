// ─── Task Controller ───────────────────────────────────────
// CRUD operations for tasks within projects

import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { logActivity } from '../utils/activity.utils';

const prisma = new PrismaClient();

// Helper to safely extract string params
function param(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val;
}

/** GET /api/projects/:id/tasks */
export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const assignedTo = req.query.assignedTo as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = { projectId: id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
}

/** POST /api/projects/:id/tasks */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const projectId = param(req, 'id');
    const userId = req.user!.userId;
    const { title, description, priority, dueDate, assignedToId } = req.body;

    if (assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assignedToId, projectId } },
      });
      if (!isMember) {
        res.status(400).json({ message: 'Assigned user is not a project member' });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title, description, priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId, createdById: userId,
        assignedToId: assignedToId || null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await logActivity(userId, projectId, 'TASK_CREATED', `Created task "${title}"`);
    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
}

/** PUT /api/tasks/:id */
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;
    const { title, description, priority, dueDate, assignedToId, status } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) { res.status(404).json({ message: 'Task not found' }); return; }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: existingTask.projectId } },
    });
    if (!membership) { res.status(403).json({ message: 'Not a project member' }); return; }

    if (membership.role === Role.MEMBER && existingTask.assignedToId !== userId) {
      res.status(403).json({ message: 'You can only update tasks assigned to you' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    await logActivity(userId, existingTask.projectId, 'TASK_UPDATED', `Updated task "${task.title}"`);
    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
}

/** DELETE /api/tasks/:id */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) { res.status(404).json({ message: 'Task not found' }); return; }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: task.projectId } },
    });
    if (!membership || membership.role !== Role.ADMIN) {
      res.status(403).json({ message: 'Only admins can delete tasks' });
      return;
    }

    await prisma.task.delete({ where: { id } });
    await logActivity(userId, task.projectId, 'TASK_DELETED', `Deleted task "${task.title}"`);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
}

/** PATCH /api/tasks/:id/status */
export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = param(req, 'id');
    const userId = req.user!.userId;
    const { status } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) { res.status(404).json({ message: 'Task not found' }); return; }

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: existingTask.projectId } },
    });
    if (!membership) { res.status(403).json({ message: 'Not a project member' }); return; }

    if (membership.role === Role.MEMBER && existingTask.assignedToId !== userId) {
      res.status(403).json({ message: 'You can only update status of tasks assigned to you' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const statusLabels: Record<string, string> = {
      TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done',
    };
    await logActivity(
      userId, existingTask.projectId, 'TASK_STATUS_CHANGED',
      `Changed "${task.title}" status to ${statusLabels[status] || status}`
    );
    res.json({ task });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
}
