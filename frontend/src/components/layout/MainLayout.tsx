import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      {/* ทั้ง Sidebar และ Content อยู่ชิดติดกันด้วย gap-3.5 และจัดกึ่งกลางรวมกันใน max-w-[1440px] */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-3.5 flex gap-3.5 items-start">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
