// ─── Task Routes ───────────────────────────────────────────
import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireProjectAdmin, requireProjectMember } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  getTasks, createTask, updateTask, deleteTask, updateTaskStatus,
} from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);

// Task routes under /api/projects/:id/tasks
router.get('/projects/:id/tasks', requireProjectMember(), getTasks);
router.post(
  '/projects/:id/tasks',
  requireProjectAdmin(),
  validate([body('title').trim().notEmpty().withMessage('Task title is required')]),
  createTask
);

// Task routes under /api/tasks/:id
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.patch(
  '/tasks/:id/status',
  validate([
    body('status').isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  ]),
  updateTaskStatus
);

export default router;
