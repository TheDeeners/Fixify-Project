import { Request, Response } from 'express';
import { AssetsService } from './assets.service';
import { asyncHandler } from '../../utils/async-handler';

export class AssetsController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const locationId = req.query.locationId as string | undefined;
    const assets = await AssetsService.getAll(locationId);
    res.status(200).json({
      message: 'ดึงข้อมูลอุปกรณ์สำเร็จ',
      data: assets,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const asset = await AssetsService.create(req.body);
    res.status(201).json({
      message: 'สร้างอุปกรณ์สำเร็จ',
      data: asset,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const asset = await AssetsService.update(req.params.id, req.body);
    res.status(200).json({
      message: 'อัปเดตอุปกรณ์สำเร็จ',
      data: asset,
    });
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await AssetsService.delete(req.params.id);
    res.status(200).json({
      message: 'ลบอุปกรณ์สำเร็จ',
    });
  });
}
