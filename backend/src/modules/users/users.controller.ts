import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { asyncHandler } from '../../utils/async-handler';
import { Role } from '@prisma/client';

export class UsersController {
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const role = req.query.role as Role | undefined;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const users = await UsersService.getAllUsers({ role, isActive });
    res.status(200).json({
      message: 'ดึงรายชื่อผู้ใช้สำเร็จ',
      data: users,
    });
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getUserById(req.params.id);
    res.status(200).json({
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: user,
    });
  });

  static createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.createUser(req.body);
    res.status(201).json({
      message: 'สร้างผู้ใช้งานสำเร็จ',
      data: user,
    });
  });

  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.updateUser(req.params.id, req.body);
    res.status(200).json({
      message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ',
      data: user,
    });
  });

  static getMyTechnicians = asyncHandler(async (req: Request, res: Response) => {
    const technicians = await UsersService.getMyTechnicians(req.user!.id);
    res.status(200).json({
      message: 'ดึงรายชื่อช่างในทีมสำเร็จ',
      data: technicians,
    });
  });
}
