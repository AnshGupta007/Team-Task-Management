// ─── Role-Based Access Control Middleware ──────────────────
// Checks if the user has the required role for a project

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware factory to check user's role in a project
 * @param requiredRole - The minimum role required (ADMIN or MEMBER)
 */
export function requireRole(requiredRole: Role) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      // Project ID can come from route params
      const rawId = req.params.id || req.params.projectId;
      const projectId = Array.isArray(rawId) ? rawId[0] : rawId;

      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      if (!projectId) {
        res.status(400).json({ message: 'Project ID is required' });
        return;
      }

      // Find the user's membership in this project
      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: userId as string,
            projectId: projectId as string,
          },
        },
      });

      if (!membership) {
        res.status(403).json({ message: 'You are not a member of this project' });
        return;
      }

      // If ADMIN is required, only ADMIN passes
      // If MEMBER is required, both ADMIN and MEMBER pass
      if (requiredRole === Role.ADMIN && membership.role !== Role.ADMIN) {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check if user is a member of the project (any role)
 */
export function requireProjectMember() {
  return requireRole(Role.MEMBER);
}

/**
 * Middleware to check if user is an admin of the project
 */
export function requireProjectAdmin() {
  return requireRole(Role.ADMIN);
}
