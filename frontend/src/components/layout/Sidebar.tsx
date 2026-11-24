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
  Menu,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  // เมนูโปร่งสบาย ไม่อึดอัด (px-3.5 py-2.5 gap-3)
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
      isActive
        ? 'bg-primary text-white font-semibold shadow-2xs'
        : 'text-text-muted hover:bg-background hover:text-primary'
    );

  return (
    <aside className="w-60 flex-shrink-0 hidden md:block select-none">
      {/* การ์ด Sidebar: เพิ่มความกว้างเป็น w-60 (240px) และเพิ่ม padding p-4 ให้อ่านง่าย สบายตา */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-2xs space-y-3">
        {/* หัวการ์ด Sidebar */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-border">
          <div className="w-7 h-7 rounded-lg bg-[#FAF2F4] text-primary flex items-center justify-center shadow-2xs">
            <Menu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text leading-tight">เมนูระบบ</div>
            {/* <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
              {role === 'ADMIN'
                ? 'การจัดการระบบ'
                : role === 'MANAGER'
                ? 'การจัดการอาคาร'
                : role === 'TECHNICIAN'
                ? 'งานซ่อมบำรุง'
                : 'แจ้งซ่อมอุปกรณ์'}
            </div> */}
          </div>
        </div>

        {/* รายการเมนู: เว้นระยะห่างไม่อึดอัด */}
        <nav className="space-y-1.5">
          {role === 'ADMIN' && (
            <>
              <NavLink to="/admin/dashboard" className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>แดชบอร์ดระบบ</span>
              </NavLink>
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
            </>
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
              <NavLink to="/requests" className={navItemClass}>
                <History className="w-4 h-4" />
                <span>ประวัติงานซ่อม</span>
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
        </nav>
      </div>
    </aside>
  );
};
