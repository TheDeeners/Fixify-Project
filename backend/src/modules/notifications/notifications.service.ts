import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class NotificationsService {
  static async getMyNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        request: {
          select: {
            id: true,
            requestNo: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif) {
      throw new AppError('ไม่พบการแจ้งเตือนนี้', 404);
    }

    if (notif.userId !== userId) {
      throw new AppError('คุณไม่มีสิทธิ์ในการแก้ไขการแจ้งเตือนนี้', 403);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
