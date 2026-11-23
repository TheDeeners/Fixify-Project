import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createUserSchema, updateUserSchema, getUserByIdSchema } from './users.schema';
import { Role } from '@prisma/client';

const router = Router();

// เฉพาะ Manager เข้าถึงช่างของตนเอง
router.get('/my-technicians', authenticate, authorize(Role.MANAGER), UsersController.getMyTechnicians);

// Admin endpoints
router.get('/', authenticate, authorize(Role.ADMIN), UsersController.getAllUsers);
router.post('/', authenticate, authorize(Role.ADMIN), validate(createUserSchema), UsersController.createUser);
router.get('/:id', authenticate, authorize(Role.ADMIN), validate(getUserByIdSchema), UsersController.getUserById);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateUserSchema), UsersController.updateUser);

export default router;
