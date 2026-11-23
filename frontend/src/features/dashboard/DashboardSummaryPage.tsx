import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Plus,
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

  const todayThai = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-text-muted">กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  if (!summary) {
    return <div className="text-center py-10 text-text-muted">ไม่สามารถโหลดข้อมูลได้</div>;
  }

  const { statusCounts, totalRequests, averageRating, recentRequests } = summary;

  return (
    <div className="space-y-3.5">
      {/* 1. Hero Banner Card (ลดความโค้งมนเป็น rounded-xl และลด padding) */}
      <div className="bg-primary text-white rounded-xl p-5 sm:p-6 shadow-2xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/95 text-[11px] px-2.5 py-0.5 rounded-md font-medium">
            <Calendar className="w-3 h-3" />
            <span>{todayThai}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            สวัสดี, คุณ{user?.name}
          </h1>
          <p className="text-xs text-white/80 font-normal leading-relaxed">
            ยินดีต้อนรับสู่ระบบ Fixify Maintenance ขอให้เป็นวันที่การดำเนินงานราบรื่นและมีประสิทธิภาพ
          </p>
        </div>

        {/* Quick Action Box */}
        <div className="bg-surface text-text rounded-lg p-3.5 shadow-sm flex items-center justify-between gap-3 min-w-[260px]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF2F4] text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-text-muted font-medium">
                {user?.role === 'MANAGER' ? 'คิวที่รอรับเรื่อง' : 'สถานะงานในระบบ'}
              </div>
              <div className="text-xs font-bold text-text">
                {statusCounts.PENDING_MANAGER > 0
                  ? `มี ${statusCounts.PENDING_MANAGER} รายการรอรับเรื่อง`
                  : 'ไม่มีงานค้างรับเรื่อง'}
              </div>
            </div>
          </div>
          <Link
            to={user?.role === 'MANAGER' ? '/manager/queue' : '/requests'}
            className="text-primary hover:text-primary-hover p-1 text-xs font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (ลด gap ระหว่างสองฝั่งเหลือ gap-3.5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Status Metric Strip */}
          <div className="bg-surface rounded-xl border border-border p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-background text-primary flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-text">ภาพรวมงานซ่อมบำรุง</h3>
                  <p className="text-[10px] text-text-muted">ข้อมูลสรุปสถานะการปฏิบัติงานล่าสุด</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>กำลังดำเนินการ {statusCounts.IN_PROGRESS} รายการ</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted block">รอรับเรื่อง</span>
                <span className="text-lg font-bold text-primary mt-0.5 block">
                  {statusCounts.PENDING_MANAGER}
                </span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted block">กำลังซ่อม</span>
                <span className="text-lg font-bold text-amber-800 mt-0.5 block">
                  {statusCounts.IN_PROGRESS}
                </span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted block">รออะไหล่</span>
                <span className="text-lg font-bold text-purple-800 mt-0.5 block">
                  {statusCounts.WAITING_PARTS || 0}
                </span>
              </div>
              <div className="p-2.5 bg-background rounded-lg border border-border text-center">
                <span className="text-[10px] text-text-muted block">เสร็จสิ้น/ปิดงาน</span>
                <span className="text-lg font-bold text-emerald-800 mt-0.5 block">
                  {statusCounts.COMPLETED + statusCounts.CLOSED}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Requests Table / List */}
          <div className="bg-surface rounded-xl border border-border p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-bold text-text">รายการใบแจ้งซ่อมล่าสุด</h3>
              </div>
              <Link
                to="/requests"
                className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentRequests.length === 0 ? (
                <p className="text-xs text-text-muted py-5 text-center">
                  ยังไม่มีประวัติใบแจ้งซ่อมในระบบ
                </p>
              ) : (
                recentRequests.map((r: any) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-background/40 transition-colors px-1.5 rounded-md">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text text-xs">{r.title}</span>
                        <span className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded border border-border">
                          {r.category?.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-text-muted flex items-center gap-2">
                        <span>อาคาร: {r.location?.name}</span>
                        <span>•</span>
                        <span>ผู้แจ้ง: {r.requester?.name}</span>
                      </div>
                    </div>
                    <Link
                      to={`/requests/${r.id}`}
                      className="text-xs text-primary font-medium hover:underline ml-2"
                    >
                      ตรวจสอบ
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-3.5">
          <div className="bg-surface rounded-xl border border-border p-4 shadow-2xs space-y-3.5">
            {/* Header การ์ด */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-bold text-text">สถิติงวดปัจจุบัน</h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                • 2569
              </span>
            </div>

            {/* Big Stat Count */}
            <div className="bg-background rounded-lg p-3 border border-border text-center">
              <div className="text-2xl font-black text-text tracking-tight">
                {totalRequests}{' '}
                <span className="text-xs text-text-muted font-normal">/ ทั้งหมด</span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                ปิดงานสมบูรณ์แล้ว {statusCounts.CLOSED} ใบ
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 text-xs">
              <div className="text-[10px] font-bold text-text-light uppercase tracking-wider">
                สัดส่วนตามประเภท
              </div>

              <div className="p-2 bg-background/60 rounded-lg border border-border flex items-center justify-between">
                <span className="text-text font-medium text-[11px]">รอการตอบรับ</span>
                <span className="font-bold text-primary text-[11px]">{statusCounts.PENDING_MANAGER} ใบ</span>
              </div>

              <div className="p-2 bg-background/60 rounded-lg border border-border flex items-center justify-between">
                <span className="text-text font-medium text-[11px]">อยู่ระหว่างดำเนินการ</span>
                <span className="font-bold text-amber-800 text-[11px]">{statusCounts.IN_PROGRESS} ใบ</span>
              </div>

              <div className="p-2 bg-background/60 rounded-lg border border-border flex items-center justify-between">
                <span className="text-text font-medium text-[11px]">ปิดงานเสร็จสิ้น</span>
                <span className="font-bold text-emerald-800 text-[11px]">{statusCounts.CLOSED} ใบ</span>
              </div>

              <div className="p-2 bg-background/60 rounded-lg border border-border flex items-center justify-between">
                <span className="text-text font-medium text-[11px]">คะแนนความพึงพอใจ</span>
                <span className="font-bold text-amber-600 text-[11px]">⭐ {averageRating} / 5.0</span>
              </div>
            </div>

            {/* Main Action Button */}
            <div className="pt-1 space-y-2 text-center">
              <Link
                to="/requests/new"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white font-medium py-2 px-3 rounded-lg text-xs shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ สร้างใบแจ้งซ่อมใหม่</span>
              </Link>

              <Link
                to="/requests"
                className="text-[11px] text-primary font-semibold hover:underline block"
              >
                ดูประวัติและรายละเอียดทั้งหมด →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
