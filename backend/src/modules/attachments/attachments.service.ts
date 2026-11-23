import { AttachmentStage } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/app-error';

export class AttachmentsService {
  static async uploadAttachments(
    requestId: string,
    user: Express.User,
    stage: AttachmentStage,
    files: Express.Multer.File[]
  ) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('ไม่พบใบแจ้งซ่อม', 404);
    }

    // ตรวจสอบสิทธิ์
    if (user.role === 'REQUESTER' && request.requesterId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์อัปโหลดไฟล์ในใบแจ้งซ่อมนี้', 403);
    }
    if (user.role === 'TECHNICIAN' && request.technicianId !== user.id) {
      throw new AppError('คุณไม่ใช่ช่างที่ได้รับมอบหมายงานนี้', 403);
    }
    if (user.role === 'MANAGER' && request.managerId !== user.id) {
      throw new AppError('คุณไม่มีสิทธิ์ในใบแจ้งซ่อมนี้', 403);
    }

    if (!files || files.length === 0) {
      throw new AppError('กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด', 400);
    }

    return prisma.$transaction(async (tx) => {
      const createdAttachments = [];

      for (const file of files) {
        const fileUrl = `/uploads/${file.filename}`;
        const attachment = await tx.attachment.create({
          data: {
            requestId,
            uploadedBy: user.id,
            fileUrl,
            stage,
          },
        });
        createdAttachments.push(attachment);
      }

      await tx.requestLog.create({
        data: {
          requestId,
          userId: user.id,
          action: 'UPLOAD_ATTACHMENT',
          note: `อัปโหลดรูปภาพ (${stage}) จำนวน ${files.length} ไฟล์`,
        },
      });

      return createdAttachments;
    });
  }
}
