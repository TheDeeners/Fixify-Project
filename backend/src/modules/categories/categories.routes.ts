import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createCategorySchema, updateCategorySchema } from './categories.schema';
import { Role } from '@prisma/client';

const router = Router();

// อ่านได้ทุก role
router.get('/', authenticate, CategoriesController.getAll);

// เขียนได้เฉพาะ ADMIN
router.post('/', authenticate, authorize(Role.ADMIN), validate(createCategorySchema), CategoriesController.create);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateCategorySchema), CategoriesController.update);
router.delete('/:id', authenticate, authorize(Role.ADMIN), CategoriesController.delete);

export default router;
