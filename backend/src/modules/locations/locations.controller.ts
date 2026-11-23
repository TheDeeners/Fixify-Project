import { Request, Response } from 'express';
import { LocationsService } from './locations.service';
import { asyncHandler } from '../../utils/async-handler';

export class LocationsController {
  static getAllLocations = asyncHandler(async (_req: Request, res: Response) => {
    const locations = await LocationsService.getAllLocations();
    res.status(200).json({
      message: 'ดึงข้อมูลสถานที่ทั้งหมดสำเร็จ',
      data: locations,
    });
  });

  static createLocation = asyncHandler(async (req: Request, res: Response) => {
    const location = await LocationsService.createLocation(req.body);
    res.status(201).json({
      message: 'สร้างสถานที่สำเร็จ',
      data: location,
    });
  });

  static updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const location = await LocationsService.updateLocation(req.params.id, req.body);
    res.status(200).json({
      message: 'อัปเดตสถานที่สำเร็จ',
      data: location,
    });
  });

  static deleteLocation = asyncHandler(async (req: Request, res: Response) => {
    await LocationsService.deleteLocation(req.params.id);
    res.status(200).json({
      message: 'ลบสถานที่สำเร็จ',
    });
  });

  static setLocationManager = asyncHandler(async (req: Request, res: Response) => {
    const result = await LocationsService.setLocationManager(req.params.id, req.body.managerId);
    res.status(200).json({
      message: 'กำหนดหัวหน้าผู้ดูแลสถานที่สำเร็จ',
      data: result,
    });
  });
}
