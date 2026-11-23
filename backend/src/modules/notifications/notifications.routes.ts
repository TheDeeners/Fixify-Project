import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();

router.get('/', authenticate, NotificationsController.getMyNotifications);
router.patch('/:id/read', authenticate, NotificationsController.markAsRead);

export default router;
