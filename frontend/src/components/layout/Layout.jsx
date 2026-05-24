import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/': 'لوحة التحكم',
  '/queue': 'إدارة الدور',
  '/add-customer': 'إضافة زبون',
  '/purchases': 'المشتريات'
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'صالون عبود';

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(108,92,255,0.08),transparent_34%,rgba(0,209,255,0.07))]" />
      <div className="hidden lg:flex">
        <Sidebar isOpen={true} onToggle={() => {}} />
      </div>

      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
