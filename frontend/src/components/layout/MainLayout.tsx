import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-background font-sans overflow-hidden">
      <Navbar />
      {/* items-start ทำให้ Sidebar มีความสูงตามคอนเทนต์ตัวเอง (h-fit) ไม่ถูกดึงยืดยาวถึงด้านล่าง */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3.5 pt-2 pb-2 flex gap-2.5 items-start overflow-hidden">
        <Sidebar />
        {/* Main Content เลื่อนอิสระ */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto pr-1 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
