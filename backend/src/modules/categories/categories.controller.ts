import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { asyncHandler } from '../../utils/async-handler';

export class CategoriesController {
  static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await CategoriesService.getAll();
    res.status(200).json({
      message: 'ดึงหมวดหมู่ทั้งหมดสำเร็จ',
      data: categories,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.create(req.body.name);
    res.status(201).json({
      message: 'สร้างหมวดหมู่สำเร็จ',
      data: category,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.update(req.params.id, req.body.name);
    res.status(200).json({
      message: 'แก้ไขหมวดหมู่สำเร็จ',
      data: category,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await CategoriesService.delete(req.params.id);
    res.status(200).json({
      message: 'ลบหมวดหมู่สำเร็จ',
    });
  });
}
