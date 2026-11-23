import { z } from 'zod';
import { Priority, RequestStatus } from '@prisma/client';

export const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'หัวข้อต้องมีความยาวอย่างน้อย 3 ตัวอักษร'),
    description: z.string().min(5, 'รายละเอียดต้องมีความยาวอย่างน้อย 5 ตัวอักษร'),
    categoryId: z.string().uuid('Category ID ต้องเป็น UUID'),
    locationId: z.string().uuid('Location ID ต้องเป็น UUID'),
    assetId: z.string().uuid('Asset ID ต้องเป็น UUID').nullable().optional(),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  }),
});

export const getRequestsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    status: z.nativeEnum(RequestStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    search: z.string().optional(),
  }),
});

export const assignRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    technicianId: z.string().uuid('Technician ID ต้องเป็น UUID'),
    note: z.string().optional(),
  }),
});

export const actionWithNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    note: z.string().optional(),
  }),
});

export const addNoteSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    note: z.string().min(1, 'กรุณาระบุข้อความบันทึก'),
  }),
});

export const addPartSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    partName: z.string().min(1, 'กรุณาระบุชื่ออะไหล่'),
    quantity: z.number().int().positive('จำนวนต้องเป็นจำนวนเต็มบวก'),
  }),
});

export const addRatingSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    score: z.number().int().min(1).max(5, 'คะแนนต้องอยู่ระหว่าง 1 ถึง 5'),
    comment: z.string().optional(),
  }),
});
