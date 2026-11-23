import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/dashboard/summary (ADMIN, MANAGER)
router.get(
  '/summary',
  authenticate,
  authorize(Role.ADMIN, Role.MANAGER),
  DashboardController.getSummary
);

export default router;
