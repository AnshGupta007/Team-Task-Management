// ─── Project Routes ────────────────────────────────────────
import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireProjectAdmin, requireProjectMember } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  getProjects, createProject, getProject, updateProject,
  deleteProject, addMember, removeMember, getMembers, getActivityLog,
} from '../controllers/project.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getProjects);

router.post(
  '/',
  validate([body('name').trim().notEmpty().withMessage('Project name is required')]),
  createProject
);

router.get('/:id', getProject);
router.put('/:id', requireProjectAdmin(), updateProject);
router.delete('/:id', requireProjectAdmin(), deleteProject);

// Member management
router.get('/:id/members', requireProjectMember(), getMembers);
router.post(
  '/:id/members',
  requireProjectAdmin(),
  validate([body('email').isEmail().withMessage('Valid email is required')]),
  addMember
);
router.delete('/:id/members/:userId', requireProjectAdmin(), removeMember);

// Activity log
router.get('/:id/activity', requireProjectMember(), getActivityLog);

export default router;
