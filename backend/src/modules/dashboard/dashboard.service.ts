import { Prisma, Role, RequestStatus, Priority } from '@prisma/client';
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
      categoryStats,
      priorityGroup,
      criticalRequests,
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
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          location: { select: { name: true } },
          requester: { select: { name: true } },
        },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              requests: {
                where,
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      // สถิติแยกตามความเร่งด่วน (Priority Distribution)
      prisma.request.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
      // งานวิกฤตและความเสี่ยง (URGENT หรือ HIGH ที่ยังไม่ปิดงานและยังไม่เสร็จ)
      prisma.request.findMany({
        where: {
          ...where,
          priority: { in: [Priority.URGENT, Priority.HIGH] },
          status: {
            notIn: [
              RequestStatus.CLOSED,
              RequestStatus.COMPLETED,
              RequestStatus.CANCELLED,
              RequestStatus.REJECTED,
            ],
          },
        },
        take: 4,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          location: { select: { name: true } },
          category: { select: { name: true } },
        },
      }),
    ]);

    // จัดระเบียบ Priority Counts ให้ครบทุกระดับ
    const priorityMap: Record<string, number> = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    priorityGroup.forEach((p) => {
      priorityMap[p.priority] = p._count.priority;
    });

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
      categoryStats: categoryStats.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.requests,
      })),
      riskWatchlist: {
        priorityCounts: priorityMap,
        criticalUnresolvedCount: criticalRequests.length,
        criticalRequests: criticalRequests.map((r) => ({
          id: r.id,
          requestNo: r.requestNo,
          title: r.title,
          priority: r.priority,
          status: r.status,
          locationName: r.location?.name,
          categoryName: r.category?.name,
          createdAt: r.createdAt,
        })),
      },
    };
  }
}
