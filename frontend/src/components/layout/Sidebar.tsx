import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  PlusCircle,
  Inbox,
  Users,
  Wrench,
  Building,
  Box,
  Layers,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../lib/cn';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
      isActive
        ? 'bg-secondary text-white shadow-sm'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
    );

  return (
    <aside className="w-64 bg-primary text-white flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex border-r border-primary-hover">
      <nav className="space-y-1.5">
        {/* Requester Navigation */}
        {role === 'REQUESTER' && (
          <>
            <NavLink to="/requests" end className={navItemClass}>
              <FileText className="w-4 h-4 text-white/70" />
              <span>รายการแจ้งซ่อมของฉัน</span>
            </NavLink>
            <NavLink to="/requests/new" className={navItemClass}>
              <PlusCircle className="w-4 h-4 text-white/90" />
              <span>สร้างใบแจ้งซ่อม</span>
            </NavLink>
          </>
        )}

        {/* Manager Navigation */}
        {role === 'MANAGER' && (
          <>
            <NavLink to="/manager/queue" className={navItemClass}>
              <Inbox className="w-4 h-4 text-white/90" />
              <span>คิวรอรับเรื่อง</span>
            </NavLink>
            <NavLink to="/manager/team-requests" className={navItemClass}>
              <FileText className="w-4 h-4 text-white/70" />
              <span>งานซ่อมของทีม</span>
            </NavLink>
            <NavLink to="/dashboard" className={navItemClass}>
              <BarChart3 className="w-4 h-4 text-white/70" />
              <span>แดชบอร์ดทีม</span>
            </NavLink>
          </>
        )}

        {/* Technician Navigation */}
        {role === 'TECHNICIAN' && (
          <>
            <NavLink to="/technician/my-tasks" className={navItemClass}>
              <Wrench className="w-4 h-4 text-white/90" />
              <span>งานที่ได้รับมอบหมาย</span>
            </NavLink>
          </>
        )}

        {/* Admin Navigation */}
        {role === 'ADMIN' && (
          <>
            <NavLink to="/admin/dashboard" className={navItemClass}>
              <BarChart3 className="w-4 h-4 text-white/90" />
              <span>ภาพรวมระบบ</span>
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass}>
              <Users className="w-4 h-4 text-white/70" />
              <span>จัดการผู้ใช้งาน</span>
            </NavLink>
            <NavLink to="/admin/locations" className={navItemClass}>
              <Building className="w-4 h-4 text-white/70" />
              <span>จัดการอาคาร/สถานที่</span>
            </NavLink>
            <NavLink to="/admin/assets" className={navItemClass}>
              <Box className="w-4 h-4 text-white/70" />
              <span>จัดการอุปกรณ์และทรัพย์สิน</span>
            </NavLink>
            <NavLink to="/admin/categories" className={navItemClass}>
              <Layers className="w-4 h-4 text-white/70" />
              <span>จัดการหมวดหมู่งานซ่อม</span>
            </NavLink>
            <NavLink to="/requests" className={navItemClass}>
              <FileText className="w-4 h-4 text-white/70" />
              <span>ใบแจ้งซ่อมทั้งหมด</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="pt-4 border-t border-white/10 text-xs text-white/60">
        <p className="font-medium tracking-wide text-white/80">FIXIFY ENTERPRISE</p>
        <p className="text-[11px] text-white/50 mt-0.5">Modern Maintenance System</p>
      </div>
    </aside>
  );
};
