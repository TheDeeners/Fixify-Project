import { Router } from 'express';
import { LocationsController } from './locations.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';
import { validate } from '../../middlewares/validate';
import { createLocationSchema, updateLocationSchema, setLocationManagerSchema } from './locations.schema';
import { Role } from '@prisma/client';

const router = Router();

// อ่านได้ทุก role (หลังจากล็อกอิน)
router.get('/', authenticate, LocationsController.getAllLocations);

// เขียนได้เฉพาะ ADMIN
router.post('/', authenticate, authorize(Role.ADMIN), validate(createLocationSchema), LocationsController.createLocation);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateLocationSchema), LocationsController.updateLocation);
router.delete('/:id', authenticate, authorize(Role.ADMIN), LocationsController.deleteLocation);
router.put('/:id/manager', authenticate, authorize(Role.ADMIN), validate(setLocationManagerSchema), LocationsController.setLocationManager);

export default router;
