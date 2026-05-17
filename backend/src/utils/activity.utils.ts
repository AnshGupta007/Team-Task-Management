// ─── Activity Logging Utility ──────────────────────────────
// Helper to log user actions for the activity feed

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Log an activity event to the database
 * Used for tracking user actions across the application
 */
export async function logActivity(
  userId: string,
  projectId: string,
  action: string,
  details?: string
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        projectId,
        action,
        details: details || null,
      },
    });
  } catch (error) {
    // Log errors but don't fail the main operation
    console.error('Failed to log activity:', error);
  }
}
