import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { MaintenanceRequest, RequestStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { MapPin, User, ChevronRight } from 'lucide-react';

export const ManagerTeamRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests?limit=50');
        setRequests(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">งานซ่อมในเขตรับผิดชอบ (Team Requests)</h1>
        <p className="text-sm text-secondary mt-1">
          ติดตามสถานะงานที่รับเรื่องแล้วและงานที่มอบหมายให้ช่างในทีม
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">กำลังโหลดรายการงาน...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-slate-200">
          <p className="text-sm text-secondary">ยังไม่มีใบแจ้งซ่อมในระบบ</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors block"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-accent">
                    {req.requestNo}
                  </span>
                  <StatusBadge status={req.status as RequestStatus} />
                  <PriorityBadge priority={req.priority} />
                </div>
                <h3 className="text-base font-semibold text-primary">{req.title}</h3>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {req.location?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    ช่าง: {req.technician ? req.technician.name : 'ยังไม่มอบหมาย'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
