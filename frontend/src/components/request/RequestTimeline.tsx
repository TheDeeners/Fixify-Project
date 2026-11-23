import React from 'react';
import { RequestLog } from '../../types';
import { Clock, User, CheckCircle2 } from 'lucide-react';

interface RequestTimelineProps {
  logs: RequestLog[];
}

export const RequestTimeline: React.FC<RequestTimelineProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-secondary text-sm">ยังไม่มีประวัติการดำเนินงาน</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const date = new Date(log.createdAt).toLocaleString('th-TH', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center ring-8 ring-white text-secondary">
                      {log.newStatus === 'CLOSED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-500" />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {log.action}
                        {log.newStatus && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            → สถานะ: {log.newStatus}
                          </span>
                        )}
                      </p>
                      {log.note && (
                        <p className="mt-1 text-sm text-secondary bg-slate-50 p-2 rounded border border-slate-100">
                          {log.note}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3 h-3" />
                        <span>{log.user?.name || 'ผู้ใช้งาน'}</span>
                        <span>•</span>
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
