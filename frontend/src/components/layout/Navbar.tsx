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

  return (
    <header className="bg-primary text-white sticky top-0 z-30 shadow-sm border-b border-primary-hover">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-primary font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <span className="font-semibold text-lg tracking-wider text-white">FIXIFY</span>
            <span className="text-xs ml-2 text-white/70 font-light hidden sm:inline border-l border-white/20 pl-2">
              ระบบแจ้งซ่อมบำรุง
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-primary">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border z-50 text-text overflow-hidden">
                <div className="p-3.5 bg-background border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-wide uppercase text-text-muted">
                    การแจ้งเตือน
                  </span>
                  <span className="text-xs text-secondary font-medium">
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
                        className={`p-3 text-xs flex items-start justify-between gap-2 hover:bg-background/60 transition-colors ${
                          !n.isRead ? 'bg-secondary/5 font-medium' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-text leading-relaxed font-normal">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-text-light mt-1 block">
                            {new Date(n.createdAt).toLocaleString('th-TH')}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-text-muted hover:text-secondary p-1"
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

          {/* User profile & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/15">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user?.name}</div>
              <div className="text-xs text-white/70 font-light">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
