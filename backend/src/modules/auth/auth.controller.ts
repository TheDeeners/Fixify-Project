import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../utils/async-handler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติบัญชีของคุณก่อนเข้าใช้งาน',
      data: user,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      data: result,
    });
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getMe(req.user!.id);
    res.status(200).json({
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: user,
    });
  });
}
