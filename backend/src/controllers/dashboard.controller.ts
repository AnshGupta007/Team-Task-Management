// ─── Dashboard Controller ──────────────────────────────────
// Aggregated statistics for the logged-in user

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** GET /api/dashboard/stats */
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    // Get all project IDs user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    // Total tasks in user's projects
    const totalTasks = await prisma.task.count({
      where: { projectId: { in: projectIds } },
    });

    // Tasks by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    // Tasks by priority
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: { projectId: { in: projectIds } },
      _count: true,
    });

    // Overdue tasks (due date passed, not done)
    const overdueTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: new Date() },
        status: { not: 'DONE' },
      },
    });

    // Tasks due within 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    const dueSoonTasks = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        dueDate: { gte: new Date(), lte: tomorrow },
        status: { not: 'DONE' },
      },
    });

    // Tasks assigned to current user
    const myTasks = await prisma.task.count({
      where: { assignedToId: userId, status: { not: 'DONE' } },
    });

    // Tasks per member (across all user's projects)
    const tasksPerMember = await prisma.task.groupBy({
      by: ['assignedToId'],
      where: {
        projectId: { in: projectIds },
        assignedToId: { not: null },
      },
      _count: true,
    });

    // Get user names for the tasks per member data
    const memberIds = tasksPerMember
      .map((t) => t.assignedToId)
      .filter((id): id is string => id !== null);
    const members = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, avatar: true },
    });
    const memberMap = new Map(members.map((m) => [m.id, m]));

    const tasksPerMemberData = tasksPerMember.map((t) => ({
      userId: t.assignedToId,
      name: memberMap.get(t.assignedToId!)?.name || 'Unassigned',
      avatar: memberMap.get(t.assignedToId!)?.avatar || '#6366f1',
      count: t._count,
    }));

    // Recent activity across all projects
    const recentActivity = await prisma.activityLog.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // Project count
    const totalProjects = projectIds.length;

    res.json({
      stats: {
        totalTasks,
        totalProjects,
        overdueTasks,
        dueSoonTasks,
        myTasks,
        tasksByStatus: {
          todo: tasksByStatus.find((t) => t.status === 'TODO')?._count || 0,
          inProgress: tasksByStatus.find((t) => t.status === 'IN_PROGRESS')?._count || 0,
          done: tasksByStatus.find((t) => t.status === 'DONE')?._count || 0,
        },
        tasksByPriority: {
          low: tasksByPriority.find((t) => t.priority === 'LOW')?._count || 0,
          medium: tasksByPriority.find((t) => t.priority === 'MEDIUM')?._count || 0,
          high: tasksByPriority.find((t) => t.priority === 'HIGH')?._count || 0,
          critical: tasksByPriority.find((t) => t.priority === 'CRITICAL')?._count || 0,
        },
        tasksPerMember: tasksPerMemberData,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
}
