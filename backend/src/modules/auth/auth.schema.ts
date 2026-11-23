import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
  }),
});
