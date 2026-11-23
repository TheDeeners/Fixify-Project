import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken } from '../../lib/jwt';
import { AppError } from '../../utils/app-error';

export class AuthService {
  static async register(data: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError('อีเมลนี้ถูกใช้งานในระบบแล้ว', 409);
    }

    const passwordHash = await hashPassword(data.password);

    // Requester สมัครเองผ่านหน้าเว็บ ต้องรอ Admin อนุมัติ (isActive: false)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: Role.REQUESTER,
        isActive: false, // รอ Admin อนุมัติ
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    const isMatch = await verifyPassword(user.passwordHash, data.password);
    if (!isMatch) {
      throw new AppError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
    }

    if (!user.isActive) {
      throw new AppError('บัญชีของคุณยังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ หรือถูกระงับการใช้งาน', 403);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        isActive: user.isActive,
      },
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้งาน', 404);
    }

    return user;
  }
}
