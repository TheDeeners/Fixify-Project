import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class AssetsService {
  static async getAll(locationId?: string) {
    const where: { locationId?: string } = {};
    if (locationId) where.locationId = locationId;

    return prisma.asset.findMany({
      where,
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async create(data: { name: string; assetCode: string; locationId: string }) {
    const existing = await prisma.asset.findUnique({
      where: { assetCode: data.assetCode },
    });

    if (existing) {
      throw new AppError('รหัสอุปกรณ์ (Asset Code) นี้ซ้ำกับในระบบ', 409);
    }

    const loc = await prisma.location.findUnique({ where: { id: data.locationId } });
    if (!loc) {
      throw new AppError('ไม่พบสถานที่ที่ระบุ', 400);
    }

    return prisma.asset.create({
      data,
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
      },
    });
  }

  static async update(id: string, data: { name?: string; assetCode?: string; locationId?: string }) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      throw new AppError('ไม่พบข้อมูลอุปกรณ์นี้', 404);
    }

    if (data.assetCode && data.assetCode !== asset.assetCode) {
      const existing = await prisma.asset.findUnique({ where: { assetCode: data.assetCode } });
      if (existing) {
        throw new AppError('รหัสอุปกรณ์นี้ซ้ำกับในระบบ', 409);
      }
    }

    if (data.locationId) {
      const loc = await prisma.location.findUnique({ where: { id: data.locationId } });
      if (!loc) {
        throw new AppError('ไม่พบสถานที่ที่ระบุ', 400);
      }
    }

    return prisma.asset.update({
      where: { id },
      data,
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
      },
    });
  }

  static async delete(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { requests: true },
    });

    if (!asset) {
      throw new AppError('ไม่พบข้อมูลอุปกรณ์นี้', 404);
    }

    if (asset.requests.length > 0) {
      throw new AppError('ไม่สามารถลบอุปกรณ์นี้ได้เนื่องจากมีประวัติแจ้งซ่อมผูกอยู่', 400);
    }

    return prisma.asset.delete({ where: { id } });
  }
}
