import { RequestStatus, Role } from '@prisma/client';
import { AppError } from '../../utils/app-error';

export interface TransitionRule {
  from: RequestStatus;
  to: RequestStatus;
  allowedRoles: Role[];
  requireNote?: boolean;
  action: string;
}

export const TRANSITION_RULES: TransitionRule[] = [
  // 1. Manager รับงาน
  {
    from: RequestStatus.PENDING_MANAGER,
    to: RequestStatus.ACCEPTED,
    allowedRoles: [Role.MANAGER],
    action: 'ACCEPT_REQUEST',
  },
  // 2. Manager ปฏิเสธงาน (ต้องมี note)
  {
    from: RequestStatus.PENDING_MANAGER,
    to: RequestStatus.REJECTED,
    allowedRoles: [Role.MANAGER],
    requireNote: true,
    action: 'REJECT_REQUEST',
  },
  // 3. Requester ยกเลิกงานก่อนหัวหน้ารับ
  {
    from: RequestStatus.PENDING_MANAGER,
    to: RequestStatus.CANCELLED,
    allowedRoles: [Role.REQUESTER],
    action: 'CANCEL_REQUEST',
  },
  // 4. Manager มอบหมายงานให้ช่าง
  {
    from: RequestStatus.ACCEPTED,
    to: RequestStatus.ASSIGNED,
    allowedRoles: [Role.MANAGER],
    action: 'ASSIGN_TECHNICIAN',
  },
  // 5. Technician เริ่มงาน
  {
    from: RequestStatus.ASSIGNED,
    to: RequestStatus.IN_PROGRESS,
    allowedRoles: [Role.TECHNICIAN],
    action: 'START_WORK',
  },
  // 6. Technician รออะไหล่
  {
    from: RequestStatus.IN_PROGRESS,
    to: RequestStatus.WAITING_PARTS,
    allowedRoles: [Role.TECHNICIAN],
    action: 'WAIT_FOR_PARTS',
  },
  // 7. Technician ได้อะไหล่ กลับมาทำต่อ
  {
    from: RequestStatus.WAITING_PARTS,
    to: RequestStatus.IN_PROGRESS,
    allowedRoles: [Role.TECHNICIAN],
    action: 'RESUME_WORK',
  },
  // 8. Technician ทำเสร็จ
  {
    from: RequestStatus.IN_PROGRESS,
    to: RequestStatus.COMPLETED,
    allowedRoles: [Role.TECHNICIAN],
    action: 'COMPLETE_WORK',
  },
  // 9. Requester ยืนยันปิดงาน
  {
    from: RequestStatus.COMPLETED,
    to: RequestStatus.CLOSED,
    allowedRoles: [Role.REQUESTER],
    action: 'CLOSE_REQUEST',
  },
  // 10. Requester เปิดงานซ่อมใหม่ (ซ่อมไม่ผ่าน ต้องมี note)
  {
    from: RequestStatus.COMPLETED,
    to: RequestStatus.IN_PROGRESS,
    allowedRoles: [Role.REQUESTER],
    requireNote: true,
    action: 'REOPEN_REQUEST',
  },
];

export function validateTransition(
  from: RequestStatus,
  to: RequestStatus,
  userRole: Role,
  note?: string
): TransitionRule {
  const rule = TRANSITION_RULES.find((r) => r.from === from && r.to === to);

  if (!rule) {
    throw new AppError(
      `ไม่สามารถเปลี่ยนสถานะจาก ${from} เป็น ${to} ได้เนื่องจากไม่อยู่ในเงื่อนไขของระบบ`,
      400
    );
  }

  if (!rule.allowedRoles.includes(userRole)) {
    throw new AppError(`บทบาท ${userRole} ไม่มีสิทธิ์ดำเนินการเปลี่ยนสถานะนี้`, 403);
  }

  if (rule.requireNote && (!note || note.trim().length === 0)) {
    throw new AppError('การดำเนินการนี้จำเป็นต้องระบุเหตุผลหรือบันทึกเพิ่มเติม (Note)', 400);
  }

  return rule;
}
