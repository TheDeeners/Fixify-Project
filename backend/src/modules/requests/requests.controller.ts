import { Request, Response } from 'express';
import { RequestsService } from './requests.service';
import { asyncHandler } from '../../utils/async-handler';
import { AppError } from '../../utils/app-error';

export class RequestsController {
  static createRequest = asyncHandler(async (req: Request, res: Response) => {
    // ตรวจสอบสถานะการยืนยันบัญชีก่อนแจ้งซ่อม
    if (!req.user!.isActive) {
      throw new AppError('บัญชีของคุณยังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ ไม่สามารถแจ้งซ่อมได้', 403);
    }

    const request = await RequestsService.createRequest(req.user!.id, req.body);
    res.status(201).json({
      message: 'สร้างใบแจ้งซ่อมสำเร็จ',
      data: request,
    });
  });

  static getRequests = asyncHandler(async (req: Request, res: Response) => {
    const result = await RequestsService.getRequests(req.user!, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      status: req.query.status as any,
      priority: req.query.priority as any,
      search: req.query.search as string,
    });
    res.status(200).json({
      message: 'ดึงรายการใบแจ้งซ่อมสำเร็จ',
      data: result.data,
      pagination: result.pagination,
    });
  });

  static getRequestById = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.getRequestById(req.params.id, req.user!);
    res.status(200).json({
      message: 'ดึงรายละเอียดใบแจ้งซ่อมสำเร็จ',
      data: request,
    });
  });

  static acceptRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.acceptRequest(req.params.id, req.user!);
    res.status(200).json({
      message: 'รับใบแจ้งซ่อมเรียบร้อยแล้ว',
      data: request,
    });
  });

  static rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.rejectRequest(req.params.id, req.user!, req.body.note);
    res.status(200).json({
      message: 'ปฏิเสธใบแจ้งซ่อมเรียบร้อยแล้ว',
      data: request,
    });
  });

  static cancelRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.cancelRequest(req.params.id, req.user!, req.body.note);
    res.status(200).json({
      message: 'ยกเลิกใบแจ้งซ่อมเรียบร้อยแล้ว',
      data: request,
    });
  });

  static assignTechnician = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.assignTechnician(
      req.params.id,
      req.user!,
      req.body.technicianId,
      req.body.note
    );
    res.status(200).json({
      message: 'มอบหมายงานให้ช่างเรียบร้อยแล้ว',
      data: request,
    });
  });

  static startWork = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.startWork(req.params.id, req.user!);
    res.status(200).json({
      message: 'เริ่มดำเนินงานซ่อมแล้ว',
      data: request,
    });
  });

  static waitForParts = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.waitForParts(req.params.id, req.user!, req.body.note);
    res.status(200).json({
      message: 'เปลี่ยนสถานะเป็นรออะไหล่แล้ว',
      data: request,
    });
  });

  static resumeWork = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.resumeWork(req.params.id, req.user!);
    res.status(200).json({
      message: 'ดำเนินการซ่อมต่อแล้ว',
      data: request,
    });
  });

  static completeWork = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.completeWork(req.params.id, req.user!, req.body.note);
    res.status(200).json({
      message: 'บันทึกการซ่อมเสร็จสิ้นแล้ว',
      data: request,
    });
  });

  static closeRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.closeRequest(req.params.id, req.user!);
    res.status(200).json({
      message: 'ยืนยันปิดงานซ่อมเรียบร้อยแล้ว',
      data: request,
    });
  });

  static reopenRequest = asyncHandler(async (req: Request, res: Response) => {
    const request = await RequestsService.reopenRequest(req.params.id, req.user!, req.body.note);
    res.status(200).json({
      message: 'ส่งกลับให้แก้ไข/ดำเนินการซ่อมใหม่แล้ว',
      data: request,
    });
  });

  static addNote = asyncHandler(async (req: Request, res: Response) => {
    const log = await RequestsService.addNote(req.params.id, req.user!, req.body.note);
    res.status(201).json({
      message: 'เพิ่มบันทึกช่วยจำสำเร็จ',
      data: log,
    });
  });

  static addPart = asyncHandler(async (req: Request, res: Response) => {
    const part = await RequestsService.addPart(req.params.id, req.user!, req.body.partName, req.body.quantity);
    res.status(201).json({
      message: 'บันทึกรายการอะไหล่สำเร็จ',
      data: part,
    });
  });

  static addRating = asyncHandler(async (req: Request, res: Response) => {
    const rating = await RequestsService.addRating(req.params.id, req.user!, req.body.score, req.body.comment);
    res.status(201).json({
      message: 'บันทึกคะแนนความพึงพอใจสำเร็จ',
      data: rating,
    });
  });
}
