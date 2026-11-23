import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class RequestLogsService {
  static async getLogsByRequestId(requestId: string, user: Express.User) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        requesterId: true,
        managerId: true,
        technicianId: true,
      },
    });

    if (!request) {
      throw new AppError('ไม่พบใบแจ้งซ่อม', 404);
    }

    // ตรวจสอบสิทธิ์ผู้เกี่ยวข้อง
    if (user.role === 'REQUESTER' && request.requesterId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์ดูประวัติของใบแจ้งซ่อมนี้', 403);
    }
    if (user.role === 'MANAGER' && request.managerId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์ดูประวัตินอกเขตรับผิดชอบของคุณ', 403);
    }
    if (user.role === 'TECHNICIAN' && request.technicianId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์ดูประวัติงานนี้', 403);
    }

    return prisma.requestLog.findMany({
      where: { requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
