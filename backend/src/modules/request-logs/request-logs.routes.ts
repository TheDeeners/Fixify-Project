import { Router } from 'express';
import { RequestLogsController } from './request-logs.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

// GET /api/requests/:id/logs (mounted under /requests/:id/logs)
router.get('/:id/logs', authenticate, RequestLogsController.getLogs);

export default router;
