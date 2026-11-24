import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  Star,
  ShieldAlert,
  Flame,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';

// Helper แสดงสถานะสไตล์แถบ Pill ตามรูปตัวอย่าง
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'PENDING_MANAGER':
      return { label: 'รอหัวหน้างาน', className: 'bg-[#FEF7EC] text-[#D97706] border-[#FDE68A]/70' };
    case 'ACCEPTED':
    case 'ASSIGNED':
      return { label: 'รับเรื่องแล้ว', className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]/70' };
    case 'IN_PROGRESS':
      return { label: 'กำลังซ่อม', className: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]/70' };
    case 'WAITING_PARTS':
      return { label: 'รออะไหล่', className: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]/70' };
    case 'COMPLETED':
      return { label: 'ซ่อมเสร็จ', className: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]/70' };
    case 'CLOSED':
      return { label: 'ปิดงานแล้ว', className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]/70' };
    case 'REJECTED':
      return { label: 'ปฏิเสธงาน', className: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]/70' };
    case 'CANCELLED':
      return { label: 'ยกเลิกแล้ว', className: 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]' };
    default:
      return { label: status, className: 'bg-stone-100 text-stone-600 border-stone-200' };
  }
};

// Helper แสดงระดับความเร่งด่วน (จุดสี + ข้อความ) ตามรูปตัวอย่าง
const getPriorityDisplay = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return { label: 'เร่งด่วนที่สุด', dotClass: 'bg-rose-500' };
    case 'HIGH':
      return { label: 'สูง', dotClass: 'bg-amber-500' };
    case 'MEDIUM':
      return { label: 'ปานกลาง', dotClass: 'bg-[#3B82F6]' };
    case 'LOW':
    default:
      return { label: 'ทั่วไป', dotClass: 'bg-slate-400' };
  }
};

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
      <div className="text-center py-20 bg-surface rounded-xl border border-border">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-text-muted">กำลังโหลดข้อมูลแดชบอร์ด...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12 bg-surface rounded-xl border border-border text-text-muted">
        ไม่สามารถโหลดข้อมูลสถิติได้
      </div>
    );
  }

  const { statusCounts, totalRequests, averageRating, totalRatings, recentRequests, riskWatchlist } = summary;

  // คำนวณอัตราความสำเร็จ
  const resolvedCount = (statusCounts.COMPLETED || 0) + (statusCounts.CLOSED || 0);
  const completionRate = totalRequests > 0 ? Math.round((resolvedCount / totalRequests) * 100) : 0;
  const inProgressTotal = (statusCounts.IN_PROGRESS || 0) + (statusCounts.WAITING_PARTS || 0);

  const priorityCounts = riskWatchlist?.priorityCounts || { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const criticalRequests = riskWatchlist?.criticalRequests || [];
  const hasCriticalRisk = criticalRequests.length > 0;

  return (
    <div className="space-y-2.5">
      {/* 1. Executive Header Bar (ลดขนาดความสูงลงให้พอดี สวยงาม ไม่ใหญ่เกินไป) */}
      <div className="bg-surface rounded-xl border border-border py-4 sm:py-4.5 px-5 sm:px-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-background px-2.5 py-0.5 rounded-md border border-border">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>{todayThai}</span>
            </span>
            <span className="text-[11px] font-semibold text-primary bg-[#FAF2F4] border border-secondary/20 px-2 py-0.5 rounded-md">
              {user?.role === 'ADMIN' ? 'ภาพรวมระบบทั้งหมด' : 'ข้อมูลงานในเขตรับผิดชอบ'}
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-text">
            {user?.role === 'ADMIN' ? 'แดชบอร์ดบริหารจัดการระบบ' : 'แดชบอร์ดสรุปงานทีม'}
          </h1>
          <p className="text-xs text-text-muted">
            ยินดีต้อนรับคุณ <span className="font-semibold text-text">{user?.name}</span> — ติดตามความคืบหน้างานซ่อมและประสิทธิภาพการบริการแบบเรียลไทม์
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {statusCounts.PENDING_MANAGER > 0 && (
            <Link
              to={user?.role === 'MANAGER' ? '/manager/queue' : '/requests?status=PENDING_MANAGER'}
              className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>รอรับเรื่อง {statusCounts.PENDING_MANAGER} รายการ</span>
            </Link>
          )}

          <Link
            to="/requests/new"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>สร้างใบแจ้งซ่อม</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Stat Cards (4 Cards Grid - ลดระยะห่างเหลือ gap-2.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: งานทั้งหมด */}
        <div className="bg-surface rounded-xl border border-border p-3 shadow-2xs flex flex-col justify-between hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              ใบแจ้งซ่อมทั้งหมด
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF2F4] text-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-text">
              {totalRequests} <span className="text-xs font-normal text-text-muted">รายการ</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
              <span>อัตราปิดงานสำเร็จ</span>
              <span className="font-semibold text-emerald-800">{completionRate}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: รอรับเรื่อง */}
        <div className="bg-surface rounded-xl border border-border p-3 shadow-2xs flex flex-col justify-between hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              รอหัวหน้ารับเรื่อง
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-text">
              {statusCounts.PENDING_MANAGER} <span className="text-xs font-normal text-text-muted">รายการ</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-800 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{statusCounts.PENDING_MANAGER > 0 ? 'ต้องการการตอบรับ' : 'ไม่มีงานคั่งค้าง'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: กำลังซ่อมบำรุง */}
        <div className="bg-surface rounded-xl border border-border p-3 shadow-2xs flex flex-col justify-between hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              กำลังดำเนินการซ่อม
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-text">
              {inProgressTotal} <span className="text-xs font-normal text-text-muted">รายการ</span>
            </div>
            <div className="mt-0.5 text-[10px] text-text-muted">
              กำลังซ่อม <span className="font-medium text-text">{statusCounts.IN_PROGRESS}</span> / รออะไหล่ <span className="font-medium text-text">{statusCounts.WAITING_PARTS || 0}</span>
            </div>
          </div>
        </div>

        {/* Card 4: ปิดงานสำเร็จ & ความพึงพอใจ */}
        <div className="bg-surface rounded-xl border border-border p-3 shadow-2xs flex flex-col justify-between hover:border-secondary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              ปิดงานเรียบร้อย
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold tracking-tight text-text">
              {resolvedCount} <span className="text-xs font-normal text-text-muted">รายการ</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
              <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                ★ {averageRating}
              </span>
              <span>จาก {totalRatings} การประเมิน</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section (8 cols : 4 cols - กระชับและแนบชิดกัน) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-start">
        {/* Left Side: Recent Requests List (8 Cols) */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="bg-surface rounded-xl border border-border shadow-2xs overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                  รายการใบแจ้งซ่อมล่าสุด
                </h3>
              </div>
              <Link
                to="/requests"
                className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* List Table: สไตล์แถวเรียบหรูตามรูปตัวอย่าง */}
            <div className="divide-y divide-border/70">
              {recentRequests.length === 0 ? (
                <div className="py-10 text-center text-xs text-text-muted">
                  ยังไม่มีประวัติใบแจ้งซ่อมในระบบ
                </div>
              ) : (
                recentRequests.map((req: any) => {
                  const statusInfo = getStatusDisplay(req.status);
                  const priorityInfo = getPriorityDisplay(req.priority);

                  return (
                    <div
                      key={req.id}
                      className="py-3.5 px-4 sm:px-5 hover:bg-background/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      {/* คอลัมน์ที่ 1: รหัสใบแจ้งซ่อม & ป้ายสถานะ */}
                      <div className="w-28 sm:w-32 flex-shrink-0 space-y-1">
                        <div className="font-mono text-xs font-semibold text-[#8C7A77]">
                          {req.requestNo}
                        </div>
                        <div>
                          <span
                            className={cn(
                              'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-wide',
                              statusInfo.className
                            )}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* คอลัมน์ที่ 2: ชื่องาน & รายละเอียดสถานที่ หมวดหมู่ ผู้แจ้ง */}
                      <div className="flex-1 min-w-0 sm:pr-3">
                        <h4 className="text-sm font-bold text-text truncate leading-snug">
                          {req.title}
                        </h4>
                        <p className="text-xs text-text-muted mt-1 truncate">
                          <span>{req.location?.name || 'ไม่ระบุสถานที่'}</span>
                          <span className="mx-1.5 text-text-muted/60">·</span>
                          <span>{req.category?.name || 'ทั่วไป'}</span>
                          <span className="mx-1.5 text-text-muted/60">·</span>
                          <span>ผู้แจ้ง {req.requester?.name || 'ไม่ระบุ'}</span>
                        </p>
                      </div>

                      {/* คอลัมน์ที่ 3 & 4: ระดับความเร่งด่วน + ปุ่มดูรายละเอียด */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-1 sm:pt-0">
                        {/* ระดับความเร่งด่วน (จุดสี + ข้อความ) */}
                        <div className="flex items-center gap-1.5 text-xs text-text-muted whitespace-nowrap">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full flex-shrink-0',
                              priorityInfo.dotClass
                            )}
                          />
                          <span>{priorityInfo.label}</span>
                        </div>

                        {/* ปุ่มดูรายละเอียด */}
                        <Link
                          to={`/requests/${req.id}`}
                          className="inline-block px-4 py-1.5 rounded-xl border border-border bg-white hover:bg-[#FAF2F4] text-xs font-medium text-primary hover:border-primary/40 transition-all shadow-2xs whitespace-nowrap"
                        >
                          ดูรายละเอียด
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: ตัวชี้วัดงานวิกฤตและความเสี่ยง + คะแนนความพึงพอใจ (4 Cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* Card: ตัวชี้วัดงานวิกฤตและความเสี่ยง (Critical Priority & Risk Watchlist) */}
          <div className="bg-surface rounded-xl border border-border p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">
                  ตัวชี้วัดงานวิกฤตและความเสี่ยง
                </h3>
              </div>
              {hasCriticalRisk ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-900 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                  <Flame className="w-2.5 h-2.5 text-rose-600" />
                  <span>เฝ้าระวัง ({criticalRequests.length})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                  <span>สภาวะปกติ</span>
                </span>
              )}
            </div>

            {/* Priority Distribution Matrix */}
            <div>
              <div className="text-[10px] font-bold text-text-light uppercase tracking-wider mb-1.5">
                การกระจายตามระดับความเร่งด่วน
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {/* URGENT */}
                <div className="p-2 bg-rose-50/60 border border-rose-200/80 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-900 block leading-tight">เร่งด่วนที่สุด</span>
                    <span className="text-[9px] text-rose-700/80">URGENT</span>
                  </div>
                  <span className="text-sm font-black text-rose-900">
                    {priorityCounts.URGENT || 0}
                  </span>
                </div>

                {/* HIGH */}
                <div className="p-2 bg-amber-50/60 border border-amber-200/80 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 block leading-tight">สูง</span>
                    <span className="text-[9px] text-amber-700/80">HIGH</span>
                  </div>
                  <span className="text-sm font-black text-amber-900">
                    {priorityCounts.HIGH || 0}
                  </span>
                </div>

                {/* MEDIUM */}
                <div className="p-2 bg-sky-50/60 border border-sky-200/80 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-900 block leading-tight">ปานกลาง</span>
                    <span className="text-[9px] text-sky-700/80">MEDIUM</span>
                  </div>
                  <span className="text-sm font-black text-sky-900">
                    {priorityCounts.MEDIUM || 0}
                  </span>
                </div>

                {/* LOW */}
                <div className="p-2 bg-stone-100/70 border border-stone-200/80 rounded-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-700 block leading-tight">ต่ำ</span>
                    <span className="text-[9px] text-stone-500">LOW</span>
                  </div>
                  <span className="text-sm font-black text-stone-800">
                    {priorityCounts.LOW || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Unresolved Watchlist */}
            <div className="space-y-1.5 pt-1 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-light uppercase tracking-wider">
                  งานด่วนที่ยังไม่ปิดงาน
                </span>
                <span className="text-[10px] text-text-muted">
                  {criticalRequests.length} งาน
                </span>
              </div>

              {criticalRequests.length === 0 ? (
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-md text-center space-y-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                  <p className="text-[11px] font-semibold text-emerald-900">
                    ไม่มีงานระดับวิกฤตคั่งค้าง
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {criticalRequests.map((req: any) => (
                    <Link
                      key={req.id}
                      to={`/requests/${req.id}`}
                      className="block p-2 bg-background/70 hover:bg-background border border-border hover:border-secondary/30 rounded-md transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-mono text-[9px] font-bold text-secondary">
                          {req.requestNo}
                        </span>
                        <div className="flex items-center gap-1">
                          <PriorityBadge priority={req.priority} />
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                      <h5 className="text-[11px] font-semibold text-text truncate group-hover:text-primary transition-colors">
                        {req.title}
                      </h5>
                      <span className="text-[9px] text-text-muted block mt-0.5 truncate">
                        {req.locationName}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: คะแนนความพึงพอใจการบริการ */}
          <div className="bg-surface rounded-xl border border-border p-3 shadow-2xs text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              คะแนนความพึงพอใจการให้บริการ
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="text-2xl font-extrabold text-text">{averageRating}</span>
              <span className="text-xs text-text-muted font-normal self-end mb-0.5">/ 5.0</span>
            </div>
            <p className="text-[10px] text-text-muted">
              คำนวณจากแบบประเมินทั้งหมด {totalRatings} ครั้ง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
