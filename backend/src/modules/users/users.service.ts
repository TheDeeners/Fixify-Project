import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/password';
import { AppError } from '../../utils/app-error';

export class UsersService {
  static async getAllUsers(filters?: { role?: Role; isActive?: boolean }) {
    const where: { role?: Role; isActive?: boolean } = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isActive: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isActive: true,
        createdAt: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        technicians: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้งานนี้', 404);
    }

    return user;
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    managerId?: string | null;
    isActive?: boolean;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError('อีเมลนี้ถูกใช้งานแล้ว', 409);
    }

    if (data.role === Role.TECHNICIAN) {
      if (!data.managerId) {
        throw new AppError('ช่างต้องระบุหัวหน้าที่สังกัด', 400);
      }
      const manager = await prisma.user.findFirst({
        where: { id: data.managerId, role: Role.MANAGER },
      });
      if (!manager) {
        throw new AppError('ไม่พบข้อมูลหัวหน้าที่ระบุ', 400);
      }
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        managerId: data.role === Role.TECHNICIAN ? data.managerId : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
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
  }

  static async updateUser(
    id: string,
    data: {
      name?: string;
      role?: Role;
      managerId?: string | null;
      isActive?: boolean;
      password?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('ไม่พบข้อมูลผู้ใช้งาน', 404);
    }

    const updateData: {
      name?: string;
      role?: Role;
      managerId?: string | null;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    if (data.managerId !== undefined) {
      if (data.managerId) {
        const mgr = await prisma.user.findFirst({
          where: { id: data.managerId, role: Role.MANAGER },
        });
        if (!mgr) {
          throw new AppError('ไม่พบข้อมูลหัวหน้าที่ระบุ', 400);
        }
      }
      updateData.managerId = data.managerId;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
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
  }

  static async getMyTechnicians(managerId: string) {
    return prisma.user.findMany({
      where: {
        managerId,
        role: Role.TECHNICIAN,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }
}
