import React from 'react';
import { Priority } from '../../types';
import { cn } from '../../lib/cn';

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: {
    label: 'ต่ำ',
    className: 'bg-stone-100 text-stone-700 border-stone-200',
  },
  MEDIUM: {
    label: 'ปานกลาง',
    className: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  HIGH: {
    label: 'สูง',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  URGENT: {
    label: 'เร่งด่วนที่สุด',
    className: 'bg-rose-50 text-rose-900 border-rose-200',
  },
};

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className,
}) => {
  const config = priorityConfig[priority] || {
    label: priority,
    className: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tracking-wide',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
