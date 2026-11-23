import React from 'react';
import { Priority } from '../../types';
import { cn } from '../../lib/cn';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: {
    label: 'ต่ำ',
    className: 'bg-slate-100 text-slate-600 border-slate-300',
  },
  MEDIUM: {
    label: 'ปานกลาง',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  HIGH: {
    label: 'สูง',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  URGENT: {
    label: 'เร่งด่วนที่สุด',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className,
}) => {
  const config = priorityConfig[priority] || {
    label: priority,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
