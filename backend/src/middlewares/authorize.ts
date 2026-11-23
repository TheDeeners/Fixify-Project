import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/app-error';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('กรุณาเข้าสู่ระบบก่อนใช้งาน', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('คุณไม่มีสิทธิ์ในการเข้าถึงการดำเนินการนี้', 403));
    }

    next();
  };
}
