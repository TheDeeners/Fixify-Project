import React from 'react';
import { RequestStatus } from '../../types';
import { cn } from '../../lib/cn';

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  PENDING_MANAGER: {
    label: 'รอหัวหน้ารับงาน',
    className: 'bg-primary/5 text-primary border-primary/20',
  },
  ACCEPTED: {
    label: 'หัวหน้ารับเรื่องแล้ว',
    className: 'bg-sky-50 text-sky-800 border-sky-200/80',
  },
  ASSIGNED: {
    label: 'มอบหมายช่างแล้ว',
    className: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการซ่อม',
    className: 'bg-amber-50 text-amber-900 border-amber-200/80',
  },
  WAITING_PARTS: {
    label: 'รออะไหล่',
    className: 'bg-purple-50 text-purple-800 border-purple-200/80',
  },
  COMPLETED: {
    label: 'ซ่อมเสร็จสิ้น',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  },
  CLOSED: {
    label: 'ปิดงานเรียบร้อย',
    className: 'bg-teal-50 text-teal-900 border-teal-200/80',
  },
  REJECTED: {
    label: 'ปฏิเสธงาน',
    className: 'bg-rose-50 text-rose-800 border-rose-200/80',
  },
  CANCELLED: {
    label: 'ยกเลิกแล้ว',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
  },
};

export const StatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({
  status,
  className,
}) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
