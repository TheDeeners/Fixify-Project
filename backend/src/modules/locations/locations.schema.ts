import { z } from 'zod';
import { LocationType } from '@prisma/client';

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'กรุณาระบุชื่อสถานที่'),
    type: z.nativeEnum(LocationType, { errorMap: () => ({ message: 'ประเภทสถานที่ต้องเป็น BUILDING, FLOOR, ROOM หรือ AREA' }) }),
    parentId: z.string().uuid().nullable().optional(),
  }),
});

export const updateLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    type: z.nativeEnum(LocationType).optional(),
    parentId: z.string().uuid().nullable().optional(),
  }),
});

export const setLocationManagerSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    managerId: z.string().uuid('Manager ID ต้องเป็น UUID'),
  }),
});
