import { z } from 'zod';

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'กรุณาระบุชื่ออุปกรณ์/ทรัพย์สิน'),
    assetCode: z.string().min(1, 'กรุณาระบุรหัสอุปกรณ์ (Asset Code)'),
    locationId: z.string().uuid('Location ID ต้องเป็น UUID'),
  }),
});

export const updateAssetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    assetCode: z.string().min(1).optional(),
    locationId: z.string().uuid().optional(),
  }),
});
