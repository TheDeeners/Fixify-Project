import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Star,
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
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-text-muted">กำลังโหลดสรุปสถิติ...</p>
      </div>
    );
  }

  if (!summary) {
    return <div className="text-center py-12 text-text-muted">ไม่สามารถโหลดแดชบอร์ดได้</div>;
  }

  const { statusCounts, totalRequests, averageRating, totalRatings, recentRequests } = summary;

  const cards = [
    {
      title: 'ใบแจ้งซ่อมทั้งหมด',
      value: totalRequests,
      icon: FileText,
      color: 'bg-primary/5 text-primary',
    },
    {
      title: 'รอหัวหน้ารับเรื่อง',
      value: statusCounts.PENDING_MANAGER,
      icon: Clock,
      color: 'bg-amber-50 text-amber-800',
    },
    {
      title: 'กำลังดำเนินการ / ซ่อม',
      value: statusCounts.IN_PROGRESS + (statusCounts.WAITING_PARTS || 0),
      icon: Wrench,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      title: 'ซ่อมเสร็จ & ปิดงานแล้ว',
      value: statusCounts.COMPLETED + statusCounts.CLOSED,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-800',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">
          {user?.role === 'ADMIN' ? 'แดชบอร์ดภาพรวมทั้งระบบ (System Dashboard)' : 'แดชบอร์ดสรุปงานทีม (Team Dashboard)'}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          สถิติภาพรวม ประสิทธิภาพงานซ่อมบำรุง และคะแนนความพึงพอใจ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-surface rounded-xl shadow-sm border border-border p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{c.title}</span>
                <div className={`p-2.5 rounded-lg ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-text mt-3 tracking-tight">{c.value}</div>
            </div>
          );
        })}
      </div>

      {/* Satisfaction Rating & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">คะแนนความพึงพอใจเฉลี่ย</h3>
          <div className="text-4xl font-extrabold text-text flex items-center gap-1.5 text-amber-500 my-2">
            <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
            <span>{averageRating}</span>
            <span className="text-sm text-text-muted font-normal">/ 5.0</span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            จากการประเมินทั้งหมด {totalRatings} ครั้ง
          </p>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
            รายการใบแจ้งซ่อมล่าสุด
          </h3>
          <div className="divide-y divide-border">
            {recentRequests.map((r: any) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-text text-sm">{r.title}</span>
                  <div className="text-text-muted flex items-center gap-2 mt-0.5">
                    <span>{r.location?.name}</span>
                    <span>•</span>
                    <span>ผู้แจ้ง: {r.requester?.name}</span>
                  </div>
                </div>
                <Link
                  to={`/requests/${r.id}`}
                  className="text-xs text-secondary font-semibold hover:underline"
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
