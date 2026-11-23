import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'ระบุ Role ไม่ถูกต้อง' }) }),
    managerId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => {
    if (data.role === Role.TECHNICIAN && !data.managerId) {
      return false;
    }
    return true;
  }, {
    message: 'ช่าง (TECHNICIAN) ต้องระบุหัวหน้าผู้ดูแล (managerId)',
    path: ['managerId'],
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID ต้องเป็น UUID'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.nativeEnum(Role).optional(),
    managerId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(8).optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID ต้องเป็น UUID'),
  }),
});
