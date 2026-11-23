import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';
import { asyncHandler } from '../../utils/async-handler';

export class DashboardController {
  static getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await DashboardService.getSummary(req.user!);
    res.status(200).json({
      message: 'ดึงข้อมูลสถิติสำเร็จ',
      data: summary,
    });
  });
}
