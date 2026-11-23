import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../lib/jwt';
import { AppError } from '../utils/app-error';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('กรุณาเข้าสู่ระบบก่อนใช้งาน', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        managerId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้งาน หรือผู้ใช้นี้ถูกลบแล้ว', 401);
    }

    if (!user.isActive) {
      throw new AppError('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน หรือยังไม่ได้รับการอนุมัติ', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('โทเคนไม่ถูกต้องหรือหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่', 401));
    }
  }
}
