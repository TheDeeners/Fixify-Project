import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
<<<<<<< HEAD
  Calendar,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
=======
  Star,
>>>>>>> a029c350357e4cc957f075f420599e15fe4a44de
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
<<<<<<< HEAD
      <div className="text-center py-20 bg-surface rounded-2xl border border-border">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-text-muted">กำลังโหลดแดชบอร์ด...</p>
=======
      <div className="text-center py-16 bg-surface rounded-xl border border-border">
        <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-text-muted">กำลังโหลดสรุปสถิติ...</p>
>>>>>>> a029c350357e4cc957f075f420599e15fe4a44de
      </div>
    );
  }

  if (!summary) {
<<<<<<< HEAD
    return <div className="text-center py-12 text-text-muted">ไม่สามารถโหลดข้อมูลได้</div>;
=======
    return <div className="text-center py-12 text-text-muted">ไม่สามารถโหลดแดชบอร์ดได้</div>;
>>>>>>> a029c350357e4cc957f075f420599e15fe4a44de
  }

  const { statusCounts, totalRequests, averageRating, totalRatings, recentRequests } = summary;

<<<<<<< HEAD
  return (
    <div className="space-y-5">
      {/* 1. Hero Banner Card (สไตล์ Burgundy Card แบบเดียวกับในภาพ HRM) */}
      <div className="bg-primary text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          {/* Badge วันที่ */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white/90 text-xs px-3 py-1 rounded-full backdrop-blur-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayThai}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            สวัสดี, คุณ{user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-white/80 font-normal leading-relaxed">
            ยินดีต้อนรับสู่ระบบ Fixify Maintenance ขอให้เป็นวันที่การดำเนินงานราบรื่นและมีประสิทธิภาพ
          </p>
        </div>

        {/* Floating Quick Action Card ใน Banner (แบบช่องบันทึกเวลาของ HRM) */}
        <div className="bg-surface text-text rounded-xl p-4 sm:p-5 shadow-md flex items-center justify-between gap-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF2F4] text-primary flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-text-muted font-medium">
                {user?.role === 'MANAGER' ? 'คิวที่รอรับเรื่อง' : 'สถานะงานในระบบ'}
=======
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
>>>>>>> a029c350357e4cc957f075f420599e15fe4a44de
              </div>
              <div className="text-sm font-bold text-text">
                {statusCounts.PENDING_MANAGER > 0
                  ? `มี ${statusCounts.PENDING_MANAGER} รายการรอรับเรื่อง`
                  : 'ไม่มีงานค้างรับเรื่อง'}
              </div>
            </div>
          </div>
          <Link
            to={user?.role === 'MANAGER' ? '/manager/queue' : '/requests'}
            className="text-primary hover:text-primary-hover p-1 text-sm font-semibold"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (สไตล์การจัดวางแบบในรูป HRM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Today's Overview + Recent Requests List (เหมือนตารางเวลา/ปฏิทินในรูป) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Status Metric Strip (แบบช่อง "การเข้างานวันนี้") */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-background text-primary flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">ภาพรวมงานซ่อมบำรุง</h3>
                  <p className="text-[11px] text-text-muted">ข้อมูลสรุปสถานะการปฏิบัติงานล่าสุด</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>กำลังดำเนินการ {statusCounts.IN_PROGRESS} รายการ</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <span className="text-[11px] text-text-muted block">รอรับเรื่อง</span>
                <span className="text-xl font-bold text-primary mt-1 block">
                  {statusCounts.PENDING_MANAGER}
                </span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <span className="text-[11px] text-text-muted block">กำลังซ่อม</span>
                <span className="text-xl font-bold text-amber-800 mt-1 block">
                  {statusCounts.IN_PROGRESS}
                </span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <span className="text-[11px] text-text-muted block">รออะไหล่</span>
                <span className="text-xl font-bold text-purple-800 mt-1 block">
                  {statusCounts.WAITING_PARTS || 0}
                </span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border text-center">
                <span className="text-[11px] text-text-muted block">เสร็จสิ้น/ปิดงาน</span>
                <span className="text-xl font-bold text-emerald-800 mt-1 block">
                  {statusCounts.COMPLETED + statusCounts.CLOSED}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Requests Table / List (สไตล์ตารางการ์ดสีขาวขอบมนแบบในรูป) */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text">รายการใบแจ้งซ่อมล่าสุด</h3>
              </div>
              <Link
                to="/requests"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentRequests.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">
                  ยังไม่มีประวัติใบแจ้งซ่อมในระบบ
                </p>
              ) : (
                recentRequests.map((r: any) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs hover:bg-background/40 transition-colors px-2 rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text text-xs">{r.title}</span>
                        <span className="text-[10px] text-text-muted bg-background px-2 py-0.5 rounded border border-border">
                          {r.category?.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted flex items-center gap-2">
                        <span>อาคาร: {r.location?.name}</span>
                        <span>•</span>
                        <span>ผู้แจ้ง: {r.requester?.name}</span>
                      </div>
                    </div>
                    <Link
                      to={`/requests/${r.id}`}
                      className="text-xs text-primary font-medium hover:underline ml-3"
                    >
                      ตรวจสอบ
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: สถิติสัดส่วนงาน + โควตา & ปุ่ม Action หลัก (สไตล์การ์ดสิทธิ์วันลาคงเหลือของ HRM) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-5">
            {/* Header การ์ด */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-text">สถิติงวดปัจจุบัน</h3>
              </div>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                • ปี 2569
              </span>
            </div>

            {/* Big Stat Count (แบบ 43/43 วัน ในรูป) */}
            <div className="bg-background rounded-xl p-4 border border-border text-center">
              <div className="text-3xl font-black text-text tracking-tight">
                {totalRequests}{' '}
                <span className="text-sm text-text-muted font-normal">/ ทั้งหมด</span>
              </div>
              <div className="text-xs text-text-muted mt-1">
                ปิดงานสมบูรณ์แล้ว {statusCounts.CLOSED} ใบ
              </div>
            </div>

            {/* Breakdown List (แบบโควตาแยกตามประเภทของ HRM) */}
            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-semibold text-text-light uppercase tracking-wider">
                สัดส่วนตามประเภท
              </div>

              <div className="p-2.5 bg-background/60 rounded-xl border border-border flex items-center justify-between">
                <span className="text-text font-medium">รอการตอบรับ</span>
                <span className="font-bold text-primary">{statusCounts.PENDING_MANAGER} ใบ</span>
              </div>

              <div className="p-2.5 bg-background/60 rounded-xl border border-border flex items-center justify-between">
                <span className="text-text font-medium">อยู่ระหว่างดำเนินการ</span>
                <span className="font-bold text-amber-800">{statusCounts.IN_PROGRESS} ใบ</span>
              </div>

              <div className="p-2.5 bg-background/60 rounded-xl border border-border flex items-center justify-between">
                <span className="text-text font-medium">ปิดงานเสร็จสิ้น</span>
                <span className="font-bold text-emerald-800">{statusCounts.CLOSED} ใบ</span>
              </div>

              <div className="p-2.5 bg-background/60 rounded-xl border border-border flex items-center justify-between">
                <span className="text-text font-medium">คะแนนความพึงพอใจ</span>
                <span className="font-bold text-amber-600">⭐ {averageRating} / 5.0</span>
              </div>
            </div>

            {/* Main Action Button (สไตล์ปุ่ม + ยื่นคำขอลาใหม่ ในรูป) */}
            <div className="pt-2 space-y-2.5 text-center">
              <Link
                to="/requests/new"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ สร้างใบแจ้งซ่อมใหม่</span>
              </Link>

              <Link
                to="/requests"
                className="text-xs text-primary font-semibold hover:underline block pt-1"
              >
                ดูประวัติและรายละเอียดการแจ้งซ่อมทั้งหมด →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
