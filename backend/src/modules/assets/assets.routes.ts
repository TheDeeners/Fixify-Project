import { Router } from 'express';
import { AssetsController } from './assets.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createAssetSchema, updateAssetSchema } from './assets.schema';
import { Role } from '@prisma/client';

const router = Router();

// อ่านได้ทุก role
router.get('/', authenticate, AssetsController.getAll);

// เขียนได้เฉพาะ ADMIN
router.post('/', authenticate, authorize(Role.ADMIN), validate(createAssetSchema), AssetsController.create);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateAssetSchema), AssetsController.update);
router.delete('/:id', authenticate, authorize(Role.ADMIN), AssetsController.delete);

export default router;
