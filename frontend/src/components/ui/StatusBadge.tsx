import React from 'react';
import { RequestStatus } from '../../types';
import { cn } from '../../lib/cn';

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  PENDING_MANAGER: {
    label: 'รอหัวหน้ารับงาน',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  ACCEPTED: {
    label: 'หัวหน้ารับเรื่องแล้ว',
    className: 'bg-sky-100 text-sky-700 border-sky-300',
  },
  ASSIGNED: {
    label: 'มอบหมายช่างแล้ว',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการซ่อม',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  WAITING_PARTS: {
    label: 'รออะไหล่',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  COMPLETED: {
    label: 'ซ่อมเสร็จสิ้น',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
  CLOSED: {
    label: 'ปิดงานเรียบร้อย',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  REJECTED: {
    label: 'ปฏิเสธงาน',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  CANCELLED: {
    label: 'ยกเลิกแล้ว',
    className: 'bg-gray-200 text-gray-600 border-gray-300',
  },
};

export const StatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({
  status,
  className,
}) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
