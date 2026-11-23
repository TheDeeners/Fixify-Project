import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Inbox,
  Users,
  Wrench,
  Building,
  Box,
  Layers,
  History,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // เมนูสไตล์ Floating Pill แบบในรูป: ถ้า Active จะเป็นสี Burgundy เข้มขอบมน
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150',
      isActive
        ? 'bg-primary text-white shadow-xs font-semibold'
        : 'text-text-muted hover:bg-background hover:text-primary'
    );

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col justify-between hidden md:flex my-4 ml-4">
      {/* Floating White Card Sidebar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-col justify-between h-[calc(100vh-6rem)] sticky top-20">
        <nav className="space-y-4 overflow-y-auto pr-1">
          {/* Section: เมนูหลัก */}
          <div>
            <div className="text-[11px] font-semibold text-text-light uppercase tracking-wider px-3 mb-1.5">
              เมนูหลัก
            </div>
            <div className="space-y-1">
              {role === 'ADMIN' && (
                <NavLink to="/admin/dashboard" className={navItemClass}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>แดชบอร์ดระบบ</span>
                </NavLink>
              )}

              {role === 'MANAGER' && (
                <>
                  <NavLink to="/dashboard" className={navItemClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    <span>แดชบอร์ด</span>
                  </NavLink>
                  <NavLink to="/manager/queue" className={navItemClass}>
                    <Inbox className="w-4 h-4" />
                    <span>คิวรอรับเรื่อง</span>
                  </NavLink>
                  <NavLink to="/manager/team-requests" className={navItemClass}>
                    <FileText className="w-4 h-4" />
                    <span>งานซ่อมของทีม</span>
                  </NavLink>
                </>
              )}

              {role === 'TECHNICIAN' && (
                <NavLink to="/technician/my-tasks" className={navItemClass}>
                  <Wrench className="w-4 h-4" />
                  <span>งานที่ได้รับมอบหมาย</span>
                </NavLink>
              )}

              {role === 'REQUESTER' && (
                <>
                  <NavLink to="/requests" end className={navItemClass}>
                    <FileText className="w-4 h-4" />
                    <span>ใบแจ้งซ่อมของฉัน</span>
                  </NavLink>
                  <NavLink to="/requests/new" className={navItemClass}>
                    <PlusCircle className="w-4 h-4" />
                    <span>สร้างใบแจ้งซ่อม</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* Section: การจัดการทีม (สำหรับ Manager) */}
          {role === 'MANAGER' && (
            <div>
              <div className="text-[11px] font-semibold text-text-light uppercase tracking-wider px-3 mb-1.5">
                การจัดการทีม
              </div>
              <div className="space-y-1">
                <NavLink to="/requests" className={navItemClass}>
                  <History className="w-4 h-4" />
                  <span>ประวัติงานซ่อม</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* Section: ผู้ดูแลระบบ (ADMIN) */}
          {role === 'ADMIN' && (
            <div>
              <div className="text-[11px] font-semibold text-text-light uppercase tracking-wider px-3 mb-1.5">
                ผู้ดูแลระบบ (ADMIN)
              </div>
              <div className="space-y-1">
                <NavLink to="/admin/users" className={navItemClass}>
                  <Users className="w-4 h-4" />
                  <span>จัดการผู้ใช้</span>
                </NavLink>
                <NavLink to="/admin/locations" className={navItemClass}>
                  <Building className="w-4 h-4" />
                  <span>จัดการอาคาร/สถานที่</span>
                </NavLink>
                <NavLink to="/admin/assets" className={navItemClass}>
                  <Box className="w-4 h-4" />
                  <span>จัดการอุปกรณ์</span>
                </NavLink>
                <NavLink to="/admin/categories" className={navItemClass}>
                  <Layers className="w-4 h-4" />
                  <span>หมวดหมู่งานซ่อม</span>
                </NavLink>
                <NavLink to="/requests" className={navItemClass}>
                  <FileText className="w-4 h-4" />
                  <span>ใบแจ้งซ่อมทั้งหมด</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Status Card (แบบเดียวกับ Crewly HRM v1.0 พร้อมจุดสถานะสีเขียว) */}
        <div className="mt-4 p-3 bg-background border border-border/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-text leading-tight">Fixify v1.0</div>
            <div className="text-[10px] text-text-muted mt-0.5">ระบบแจ้งซ่อมบำรุง</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
};
