import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  Star,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return <div className="text-center py-12">กำลังโหลดสรุปสถิติ...</div>;
  }

  if (!summary) {
    return <div className="text-center py-12 text-secondary">ไม่สามารถโหลดแดชบอร์ดได้</div>;
  }

  const { statusCounts, totalRequests, averageRating, totalRatings, recentRequests } = summary;

  const cards = [
    {
      title: 'ใบแจ้งซ่อมทั้งหมด',
      value: totalRequests,
      icon: FileText,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'รอหัวหน้ารับเรื่อง',
      value: statusCounts.PENDING_MANAGER,
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'กำลังดำเนินการ / ซ่อม',
      value: statusCounts.IN_PROGRESS + (statusCounts.WAITING_PARTS || 0),
      icon: Wrench,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'ซ่อมเสร็จ & ปิดงานแล้ว',
      value: statusCounts.COMPLETED + statusCounts.CLOSED,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {user?.role === 'ADMIN' ? 'แดชบอร์ดภาพรวมทั้งระบบ (System Dashboard)' : 'แดชบอร์ดสรุปงานทีม (Team Dashboard)'}
        </h1>
        <p className="text-sm text-secondary mt-1">
          สถิติภาพรวม ประสิทธิภาพงานซ่อมบำรุง และคะแนนความพึงพอใจ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-surface rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-secondary">{c.title}</span>
                <div className={`p-2 rounded-lg ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-primary mt-3">{c.value}</div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rating & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-bold text-secondary mb-2">คะแนนความพึงพอใจเฉลี่ย</h3>
          <div className="text-4xl font-black text-primary flex items-center gap-1 text-amber-500">
            <Star className="w-8 h-8 fill-amber-400" />
            <span>{averageRating}</span>
            <span className="text-base text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            จากการประเมินทั้งหมด {totalRatings} ครั้ง
          </p>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-primary mb-4">รายการใบแจ้งซ่อมล่าสุด</h3>
          <div className="divide-y divide-slate-100">
            {recentRequests.map((r: any) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <span className="font-semibold text-primary">{r.title}</span>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{r.location?.name}</span>
                    <span>•</span>
                    <span>ผู้แจ้ง: {r.requester?.name}</span>
                  </div>
                </div>
                <Link
                  to={`/requests/${r.id}`}
                  className="text-xs text-accent font-semibold hover:underline"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
