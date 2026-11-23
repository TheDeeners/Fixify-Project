import { Prisma, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class DashboardService {
  static async getSummary(user: Express.User) {
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER) {
      throw new AppError('เฉพาะ Admin หรือ Manager เท่านั้นที่สามารถดู Dashboard ได้', 403);
    }

    const where: Prisma.RequestWhereInput = {};
    if (user.role === Role.MANAGER) {
      where.managerId = user.id;
    }

    const [
      totalRequests,
      pendingCount,
      inProgressCount,
      waitingPartsCount,
      completedCount,
      closedCount,
      rejectedCount,
      ratings,
      recentRequests,
    ] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.count({ where: { ...where, status: 'PENDING_MANAGER' } }),
      prisma.request.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.request.count({ where: { ...where, status: 'WAITING_PARTS' } }),
      prisma.request.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.request.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.request.count({ where: { ...where, status: 'REJECTED' } }),
      prisma.rating.aggregate({
        _avg: { score: true },
        _count: { score: true },
        where: user.role === Role.MANAGER ? { request: { managerId: user.id } } : undefined,
      }),
      prisma.request.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
          requester: { select: { name: true } },
        },
      }),
    ]);

    return {
      totalRequests,
      statusCounts: {
        PENDING_MANAGER: pendingCount,
        IN_PROGRESS: inProgressCount,
        WAITING_PARTS: waitingPartsCount,
        COMPLETED: completedCount,
        CLOSED: closedCount,
        REJECTED: rejectedCount,
      },
      averageRating: ratings._avg.score ? Number(ratings._avg.score.toFixed(1)) : 0,
      totalRatings: ratings._count.score,
      recentRequests,
    };
  }
}
