import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Check } from 'lucide-react';
import api from '../../lib/api';
import { Notification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return name.slice(0, 2);
  };

  return (
    <header className="bg-surface sticky top-0 z-30 border-b border-border shadow-2xs">
      <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between h-14">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-2xs">
            F
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-text">
              Fixify
            </span>
            <span className="bg-[#FAF2F4] text-primary border border-secondary/20 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
              MAINTENANCE
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 text-text-muted hover:text-primary rounded-lg hover:bg-background transition-colors focus:outline-none"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border z-50 text-text overflow-hidden">
                <div className="p-3 bg-background/80 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-wider text-text-muted uppercase">
                    การแจ้งเตือน
                  </span>
                  <span className="text-xs text-primary font-semibold">
                    ยังไม่อ่าน {unreadCount} รายการ
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-text-muted">
                      ไม่มีการแจ้งเตือน
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 text-xs flex items-start justify-between gap-2 hover:bg-background/50 transition-colors ${
                          !n.isRead ? 'bg-[#FAF2F4]/60 font-medium' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-text leading-relaxed font-normal">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-text-light mt-0.5 block">
                            {new Date(n.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-text-muted hover:text-primary p-1"
                            title="ทำเครื่องหมายว่าอ่านแล้ว"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center gap-2 bg-background border border-border/80 rounded-lg py-1 px-2.5">
            <div className="w-6 h-6 rounded-md bg-primary text-white font-bold text-[11px] flex items-center justify-center">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden sm:block pr-1">
              <div className="text-xs font-semibold text-text leading-tight">{user?.name}</div>
              <div className="text-[10px] text-text-muted font-normal leading-tight">{user?.email}</div>
            </div>
            <span className="bg-[#FAF2F4] text-primary text-[10px] font-bold px-1.5 py-0.5 rounded border border-secondary/20">
              {user?.role}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-background"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
