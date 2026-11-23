import { Priority, RequestStatus, Role, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { LocationsService } from '../locations/locations.service';
import { validateTransition } from './request-state';
import { AppError } from '../../utils/app-error';

export class RequestsService {
  // สร้างหมายเลขใบแจ้งซ่อม MR-YYYY-XXXX ในรูปแบบ atomic / safe sequence
  private static async generateRequestNo(tx: Prisma.TransactionClient): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `MR-${currentYear}-`;

    const lastRequest = await tx.request.findFirst({
      where: {
        requestNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        requestNo: 'desc',
      },
      select: {
        requestNo: true,
      },
    });

    let nextNumber = 1;
    if (lastRequest && lastRequest.requestNo) {
      const parts = lastRequest.requestNo.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextNumber = lastSeq + 1;
        }
      }
    }

    const paddedSeq = String(nextNumber).padStart(4, '0');
    return `${prefix}${paddedSeq}`;
  }

  // 1. สร้างใบแจ้งซ่อม (Requester)
  static async createRequest(
    requesterId: string,
    data: {
      title: string;
      description: string;
      categoryId: string;
      locationId: string;
      assetId?: string | null;
      priority: Priority;
    }
  ) {
    // กฎข้อ 1: ค้นหา managerId จาก location โดยเดินขึ้นไปตาม parentId
    const managerId = await LocationsService.resolveManagerForLocation(data.locationId);

    // ตรวจสอบ Asset ถ้ามี
    if (data.assetId) {
      const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) {
        throw new AppError('ไม่พบอุปกรณ์ที่ระบุ', 400);
      }
    }

    // ทำงานใน Prisma Transaction เดียวกัน
    return prisma.$transaction(async (tx) => {
      const requestNo = await this.generateRequestNo(tx);

      const request = await tx.request.create({
        data: {
          requestNo,
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          locationId: data.locationId,
          assetId: data.assetId || null,
          priority: data.priority,
          status: RequestStatus.PENDING_MANAGER,
          requesterId,
          managerId,
        },
        include: {
          category: true,
          location: true,
          asset: true,
          requester: { select: { id: true, name: true, email: true } },
          manager: { select: { id: true, name: true, email: true } },
        },
      });

      // กฎข้อ 4: บันทึก Log
      await tx.requestLog.create({
        data: {
          requestId: request.id,
          userId: requesterId,
          action: 'CREATE_REQUEST',
          oldStatus: null,
          newStatus: RequestStatus.PENDING_MANAGER,
          note: 'สร้างใบแจ้งซ่อมใหม่',
        },
      });

      // แจ้งเตือน Manager
      await tx.notification.create({
        data: {
          userId: managerId,
          requestId: request.id,
          message: `มีใบแจ้งซ่อมใหม่ (${requestNo}): ${request.title}`,
        },
      });

      return request;
    });
  }

  // 2. Data Scoping ในการค้นหา Requests
  static async getRequests(
    user: Express.User,
    query: {
      page: number;
      limit: number;
      status?: RequestStatus;
      priority?: Priority;
      search?: string;
    }
  ) {
    const { page, limit, status, priority, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.RequestWhereInput = {};

    // Data Scoping ตามข้อกำหนด
    if (user.role === Role.REQUESTER) {
      where.requesterId = user.id;
    } else if (user.role === Role.TECHNICIAN) {
      where.technicianId = user.id;
    } else if (user.role === Role.MANAGER) {
      where.managerId = user.id;
    }
    // ADMIN เห็นทั้งหมด

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { requestNo: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          location: { select: { id: true, name: true, type: true } },
          asset: { select: { id: true, name: true, assetCode: true } },
          requester: { select: { id: true, name: true, email: true } },
          manager: { select: { id: true, name: true, email: true } },
          technician: { select: { id: true, name: true, email: true } },
          _count: { select: { attachments: true, repairParts: true } },
        },
      }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. ดูรายละเอียดใบแจ้งซ่อมตามสิทธิ์
  static async getRequestById(id: string, user: Express.User) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        category: true,
        location: {
          include: {
            parent: true,
          },
        },
        asset: true,
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
        attachments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        repairParts: {
          orderBy: { createdAt: 'asc' },
        },
        rating: true,
        requestLogs: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      throw new AppError('ไม่พบใบแจ้งซ่อมนี้', 404);
    }

    // ตรวจสอบสิทธิ์การเข้าดู
    if (user.role === Role.REQUESTER && request.requesterId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์เข้าดูใบแจ้งซ่อมนี้', 403);
    }
    if (user.role === Role.MANAGER && request.managerId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์เข้าดูใบแจ้งซ่อมนอกเขตรับผิดชอบของคุณ', 403);
    }
    if (user.role === Role.TECHNICIAN && request.technicianId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์เข้าดูงานที่ไม่ได้มอบหมายให้คุณ', 403);
    }

    return request;
  }

  // Helper ดำเนินการเปลี่ยนสถานะตาม State Machine พร้อมบันทึก Log
  private static async executeTransition(
    requestId: string,
    user: Express.User,
    targetStatus: RequestStatus,
    note?: string,
    additionalUpdates: Prisma.RequestUpdateInput = {}
  ) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({ where: { id: requestId } });
      if (!request) {
        throw new AppError('ไม่พบใบแจ้งซ่อม', 404);
      }

      // ตรวจสอบเจ้าของ/ผู้รับผิดชอบ
      if (user.role === Role.MANAGER && request.managerId !== user.id) {
        throw new AppError('คุณไม่ใช่หัวหน้าผู้ดูแลใบแจ้งซ่อมนี้', 403);
      }
      if (user.role === Role.TECHNICIAN && request.technicianId !== user.id) {
        throw new AppError('คุณไม่ใช่ช่างที่ได้รับมอบหมายงานนี้', 403);
      }
      if (user.role === Role.REQUESTER && request.requesterId !== user.id) {
        throw new AppError('คุณไม่ใช่เจ้าของใบแจ้งซ่อมนี้', 403);
      }

      // ตรวจสอบ state transition
      const rule = validateTransition(request.status, targetStatus, user.role, note);

      const updated = await tx.request.update({
        where: { id: requestId },
        data: {
          status: targetStatus,
          ...additionalUpdates,
        },
        include: {
          category: true,
          location: true,
          requester: { select: { id: true, name: true } },
          technician: { select: { id: true, name: true } },
        },
      });

      // กฎข้อ 4: บันทึก Log ทุกครั้ง
      await tx.requestLog.create({
        data: {
          requestId,
          userId: user.id,
          action: rule.action,
          oldStatus: request.status,
          newStatus: targetStatus,
          note: note || null,
        },
      });

      // แจ้งเตือนผู้เกี่ยวข้อง
      const notifyUserId =
        user.role === Role.REQUESTER
          ? request.managerId
          : request.requesterId;

      await tx.notification.create({
        data: {
          userId: notifyUserId,
          requestId,
          message: `ใบแจ้งซ่อม ${request.requestNo} เปลี่ยนสถานะเป็น ${targetStatus}`,
        },
      });

      return updated;
    });
  }

  // 4. Actions: Accept
  static async acceptRequest(id: string, user: Express.User) {
    return this.executeTransition(id, user, RequestStatus.ACCEPTED);
  }

  // 5. Actions: Reject
  static async rejectRequest(id: string, user: Express.User, note: string) {
    return this.executeTransition(id, user, RequestStatus.REJECTED, note);
  }

  // 6. Actions: Cancel
  static async cancelRequest(id: string, user: Express.User, note?: string) {
    return this.executeTransition(id, user, RequestStatus.CANCELLED, note);
  }

  // 7. Actions: Assign Technician
  static async assignTechnician(id: string, user: Express.User, technicianId: string, note?: string) {
    // กฎข้อ 3: technician.manager_id ต้องตรงกับ request.manager_id และ is_active = true
    const tech = await prisma.user.findFirst({
      where: {
        id: technicianId,
        role: Role.TECHNICIAN,
        managerId: user.id,
        isActive: true,
      },
    });

    if (!tech) {
      throw new AppError('ช่างที่เลือกไม่อยู่ในทีมของคุณ หรือสถานะไม่พร้อมรับงาน', 400);
    }

    return this.executeTransition(id, user, RequestStatus.ASSIGNED, note, {
      technicianId,
      assignedAt: new Date(),
    });
  }

  // 8. Actions: Start work
  static async startWork(id: string, user: Express.User) {
    return this.executeTransition(id, user, RequestStatus.IN_PROGRESS);
  }

  // 9. Actions: Wait for parts
  static async waitForParts(id: string, user: Express.User, note?: string) {
    return this.executeTransition(id, user, RequestStatus.WAITING_PARTS, note);
  }

  // 10. Actions: Resume work
  static async resumeWork(id: string, user: Express.User) {
    return this.executeTransition(id, user, RequestStatus.IN_PROGRESS);
  }

  // 11. Actions: Complete work
  static async completeWork(id: string, user: Express.User, note?: string) {
    return this.executeTransition(id, user, RequestStatus.COMPLETED, note, {
      completedAt: new Date(),
    });
  }

  // 12. Actions: Close request
  static async closeRequest(id: string, user: Express.User) {
    return this.executeTransition(id, user, RequestStatus.CLOSED, undefined, {
      closedAt: new Date(),
    });
  }

  // 13. Actions: Reopen request
  static async reopenRequest(id: string, user: Express.User, note: string) {
    return this.executeTransition(id, user, RequestStatus.IN_PROGRESS, note);
  }

  // 14. Add note
  static async addNote(id: string, user: Express.User, note: string) {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) throw new AppError('ไม่พบใบแจ้งซ่อม', 404);

    if (user.role === Role.TECHNICIAN && request.technicianId !== user.id) {
      throw new AppError('คุณไม่ใช่ช่างที่ได้รับมอบหมายงานนี้', 403);
    }

    return prisma.requestLog.create({
      data: {
        requestId: id,
        userId: user.id,
        action: 'ADD_NOTE',
        note,
      },
    });
  }

  // 15. Add repair part
  static async addPart(id: string, user: Express.User, partName: string, quantity: number) {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) throw new AppError('ไม่พบใบแจ้งซ่อม', 404);

    if (user.role === Role.TECHNICIAN && request.technicianId !== user.id) {
      throw new AppError('คุณไม่ใช่ช่างที่ได้รับมอบหมายงานนี้', 403);
    }

    return prisma.$transaction(async (tx) => {
      const part = await tx.repairPart.create({
        data: {
          requestId: id,
          partName,
          quantity,
        },
      });

      await tx.requestLog.create({
        data: {
          requestId: id,
          userId: user.id,
          action: 'ADD_REPAIR_PART',
          note: `เพิ่มรายการอะไหล่: ${partName} จำนวน ${quantity} ชิ้น`,
        },
      });

      return part;
    });
  }

  // 16. Add rating (กฎข้อ 8: เฉพาะเจ้าของใบ, สถานะ CLOSED, ครั้งเดียว)
  static async addRating(id: string, user: Express.User, score: number, comment?: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: { rating: true },
    });

    if (!request) throw new AppError('ไม่พบใบแจ้งซ่อม', 404);

    if (request.requesterId !== user.id) {
      throw new AppError('เฉพาะผู้แจ้งซ่อมเจ้าของใบเท่านั้นที่สามารถให้คะแนนได้', 403);
    }

    if (request.status !== RequestStatus.CLOSED) {
      throw new AppError('สามารถให้คะแนนได้เฉพาะใบแจ้งซ่อมที่ปิดงานแล้ว (CLOSED) เท่านั้น', 400);
    }

    if (request.rating) {
      throw new AppError('ใบแจ้งซ่อมนี้ได้รับการประเมินความพึงพอใจแล้ว ไม่สามารถประเมินซ้ำได้', 400);
    }

    return prisma.rating.create({
      data: {
        requestId: id,
        score,
        comment,
      },
    });
  }
}
