import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
import { asyncHandler } from '../../utils/async-handler';

export class NotificationsController {
  static getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await NotificationsService.getMyNotifications(req.user!.id);
    res.status(200).json({
      message: 'ดึงรายการแจ้งเตือนสำเร็จ',
      data: notifications,
    });
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await NotificationsService.markAsRead(req.params.id, req.user!.id);
    res.status(200).json({
      message: 'อัปเดตสถานะการแจ้งเตือนสำเร็จ',
      data: notification,
    });
  });
}
