import { Router } from 'express';
import { RequestsController } from './requests.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import {
  createRequestSchema,
  getRequestsQuerySchema,
  assignRequestSchema,
  actionWithNoteSchema,
  addNoteSchema,
  addPartSchema,
  addRatingSchema,
} from './requests.schema';
import { Role } from '@prisma/client';

const router = Router();

// 1. สร้างและดึงใบแจ้งซ่อม
router.post(
  '/',
  authenticate,
  authorize(Role.REQUESTER),
  validate(createRequestSchema),
  RequestsController.createRequest
);

router.get(
  '/',
  authenticate,
  validate(getRequestsQuerySchema),
  RequestsController.getRequests
);

router.get(
  '/:id',
  authenticate,
  RequestsController.getRequestById
);

// 2. State Actions ตาม State Machine
// Manager: รับใบงาน
router.post(
  '/:id/accept',
  authenticate,
  authorize(Role.MANAGER),
  RequestsController.acceptRequest
);

// Manager: ปฏิเสธใบงาน (require note)
router.post(
  '/:id/reject',
  authenticate,
  authorize(Role.MANAGER),
  validate(actionWithNoteSchema),
  RequestsController.rejectRequest
);

// Manager: มอบหมายช่าง
router.post(
  '/:id/assign',
  authenticate,
  authorize(Role.MANAGER),
  validate(assignRequestSchema),
  RequestsController.assignTechnician
);

// Requester: ขอยกเลิก (ก่อนหัวหน้ารับ)
router.post(
  '/:id/cancel',
  authenticate,
  authorize(Role.REQUESTER),
  validate(actionWithNoteSchema),
  RequestsController.cancelRequest
);

// Technician: เริ่มงาน
router.post(
  '/:id/start',
  authenticate,
  authorize(Role.TECHNICIAN),
  RequestsController.startWork
);

// Technician: รออะไหล่
router.post(
  '/:id/wait-parts',
  authenticate,
  authorize(Role.TECHNICIAN),
  validate(actionWithNoteSchema),
  RequestsController.waitForParts
);

// Technician: ดำเนินงานต่อ
router.post(
  '/:id/resume',
  authenticate,
  authorize(Role.TECHNICIAN),
  RequestsController.resumeWork
);

// Technician: ซ่อมเสร็จ
router.post(
  '/:id/complete',
  authenticate,
  authorize(Role.TECHNICIAN),
  validate(actionWithNoteSchema),
  RequestsController.completeWork
);

// Requester: ปิดงาน
router.post(
  '/:id/close',
  authenticate,
  authorize(Role.REQUESTER),
  RequestsController.closeRequest
);

// Requester: เปิดงานใหม่ (ซ่อมไม่ผ่าน require note)
router.post(
  '/:id/reopen',
  authenticate,
  authorize(Role.REQUESTER),
  validate(actionWithNoteSchema),
  RequestsController.reopenRequest
);

// 3. Notes & Parts
router.post(
  '/:id/notes',
  authenticate,
  authorize(Role.TECHNICIAN),
  validate(addNoteSchema),
  RequestsController.addNote
);

router.post(
  '/:id/parts',
  authenticate,
  authorize(Role.TECHNICIAN),
  validate(addPartSchema),
  RequestsController.addPart
);

// 4. Rating
router.post(
  '/:id/rating',
  authenticate,
  authorize(Role.REQUESTER),
  validate(addRatingSchema),
  RequestsController.addRating
);

export default router;
