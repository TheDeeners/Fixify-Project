import { Request, Response } from 'express';
import { RequestLogsService } from './request-logs.service';
import { asyncHandler } from '../../utils/async-handler';

export class RequestLogsController {
  static getLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await RequestLogsService.getLogsByRequestId(req.params.id, req.user!);
    res.status(200).json({
      message: 'ดึงบันทึกประวัติการดำเนินงานสำเร็จ',
      data: logs,
    });
  });
}
