import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { MaintenanceRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Wrench, MapPin, Calendar, ChevronRight } from 'lucide-react';

export const TechnicianMyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/requests?limit=50');
        setTasks(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-secondary/10 rounded-xl text-secondary">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">งานที่ได้รับมอบหมาย (My Tasks)</h1>
          <p className="text-sm text-text-muted">
            รายการงานซ่อมที่คุณต้องเข้าดำเนินการ แก้ไข และอัปเดตสถานะ
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-text-muted">กำลังโหลดงานซ่อม...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-base font-medium text-text">ไม่มีงานซ่อมค้างในขณะนี้</p>
          <p className="text-xs text-text-muted mt-1">ยินดีด้วย คุณทำงานเสร็จสิ้นครบทุกรายการแล้ว!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              to={`/requests/${task.id}`}
              className="bg-surface rounded-xl shadow-sm border border-border p-5 hover:border-secondary transition-all block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-secondary">
                  {task.requestNo}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={task.status as RequestStatus} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              <h3 className="text-base font-semibold text-text group-hover:text-primary transition-colors">
                {task.title}
              </h3>
              <p className="text-xs text-text-muted line-clamp-2 mt-1 mb-3">
                {task.description}
              </p>

              <div className="text-xs text-text-muted pt-3 border-t border-border flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-light" />
                    <span>{task.location?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-text-light" />
                    <span>มอบหมายเมื่อ: {task.assignedAt ? new Date(task.assignedAt).toLocaleDateString('th-TH') : '-'}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-light group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
