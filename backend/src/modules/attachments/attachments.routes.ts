import { Router } from 'express';
import { AttachmentsController } from './attachments.controller';
import { authenticate } from '../../middlewares/authenticate';
import { upload } from '../../middlewares/upload';

const router = Router();

// POST /api/requests/:id/attachments
router.post(
  '/:id/attachments',
  authenticate,
  upload.array('images', 5),
  AttachmentsController.upload
);

export default router;
