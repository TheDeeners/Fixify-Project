import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class CategoriesService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async create(name: string) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('มีหมวดหมู่นี้อยู่ในระบบแล้ว', 409);
    }
    return prisma.category.create({ data: { name } });
  }

  static async update(id: string, name: string) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) {
      throw new AppError('ไม่พบหมวดหมู่นี้', 404);
    }
    return prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  static async delete(id: string) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { requests: true },
    });
    if (!cat) {
      throw new AppError('ไม่พบหมวดหมู่นี้', 404);
    }
    if (cat.requests.length > 0) {
      throw new AppError('ไม่สามารถลบหมวดหมู่นี้ได้เนื่องจากมีใบแจ้งซ่อมผูกอยู่', 400);
    }
    return prisma.category.delete({ where: { id } });
  }
}
