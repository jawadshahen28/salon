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
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar isOpen={true} onToggle={() => {}} />
      </div>

      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
