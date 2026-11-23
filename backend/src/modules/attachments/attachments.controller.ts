import { Request, Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { asyncHandler } from '../../utils/async-handler';
import { AttachmentStage } from '@prisma/client';
import { AppError } from '../../utils/app-error';

export class AttachmentsController {
  static upload = asyncHandler(async (req: Request, res: Response) => {
    const stage = (req.body.stage as AttachmentStage) || AttachmentStage.BEFORE;

    if (!Object.values(AttachmentStage).includes(stage)) {
      throw new AppError('stage ต้องเป็น BEFORE หรือ AFTER เท่านั้น', 400);
    }

    const files = req.files as Express.Multer.File[];
    const attachments = await AttachmentsService.uploadAttachments(
      req.params.id,
      req.user!,
      stage,
      files
    );

    res.status(201).json({
      message: 'อัปโหลดรูปภาพสำเร็จ',
      data: attachments,
    });
  });
}
