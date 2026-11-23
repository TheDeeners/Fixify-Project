import { LocationType, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class LocationsService {
  static async getAllLocations() {
    return prisma.location.findMany({
      include: {
        parent: {
          select: { id: true, name: true, type: true },
        },
        locationManager: {
          include: {
            manager: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createLocation(data: { name: string; type: LocationType; parentId?: string | null }) {
    if (data.parentId) {
      const parent = await prisma.location.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new AppError('ไม่พบสถานที่หลัก (Parent Location) ที่ระบุ', 400);
      }
    }

    return prisma.location.create({
      data: {
        name: data.name,
        type: data.type,
        parentId: data.parentId || null,
      },
    });
  }

  static async updateLocation(id: string, data: { name?: string; type?: LocationType; parentId?: string | null }) {
    const loc = await prisma.location.findUnique({ where: { id } });
    if (!loc) {
      throw new AppError('ไม่พบสถานที่', 404);
    }

    if (data.parentId) {
      if (data.parentId === id) {
        throw new AppError('สถานที่หลักต้องไม่เป็นตัวเอง', 400);
      }
      const parent = await prisma.location.findUnique({ where: { id: data.parentId } });
      if (!parent) {
        throw new AppError('ไม่พบสถานที่หลักที่ระบุ', 400);
      }
    }

    return prisma.location.update({
      where: { id },
      data,
    });
  }

  static async deleteLocation(id: string) {
    const loc = await prisma.location.findUnique({
      where: { id },
      include: { children: true, requests: true },
    });

    if (!loc) {
      throw new AppError('ไม่พบสถานที่', 404);
    }

    if (loc.children.length > 0) {
      throw new AppError('ไม่สามารถลบสถานที่นี้ได้เนื่องจากมีสถานที่ย่อยอยู่ภายใน', 400);
    }

    if (loc.requests.length > 0) {
      throw new AppError('ไม่สามารถลบสถานที่นี้ได้เนื่องจากมีประวัติการแจ้งซ่อมผูกอยู่', 400);
    }

    return prisma.location.delete({ where: { id } });
  }

  static async setLocationManager(locationId: string, managerId: string) {
    const loc = await prisma.location.findUnique({ where: { id: locationId } });
    if (!loc) {
      throw new AppError('ไม่พบสถานที่', 404);
    }

    const manager = await prisma.user.findFirst({
      where: { id: managerId, role: Role.MANAGER, isActive: true },
    });

    if (!manager) {
      throw new AppError('ไม่พบข้อมูลหัวหน้างาน หรือสถานะของหัวหน้างานไม่พร้อมใช้งาน', 400);
    }

    // 1 location มีหัวหน้าได้ 1 คน (upsert)
    return prisma.locationManager.upsert({
      where: { locationId },
      update: { managerId },
      create: { locationId, managerId },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Business Rule: เดินขึ้นไปตาม parentId จนเจอหัวหน้าที่ดูแล
  static async resolveManagerForLocation(locationId: string): Promise<string> {
    let currentId: string | null = locationId;

    while (currentId) {
      const loc = await prisma.location.findUnique({
        where: { id: currentId },
        include: { locationManager: true },
      });

      if (!loc) {
        break;
      }

      if (loc.locationManager && loc.locationManager.managerId) {
        return loc.locationManager.managerId;
      }

      currentId = loc.parentId;
    }

    throw new AppError('ไม่พบหัวหน้างานที่ดูแลสถานที่หรือตึกนี้ กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดหัวหน้าประจำสถานที่', 400);
  }
}
