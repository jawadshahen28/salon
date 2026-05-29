import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles = {
  '/': 'لوحة التحكم',
  '/queue': 'إدارة الدور',
  '/add-customer': 'إضافة زبون',
  '/purchases': 'المشتريات',
  '/daily-report': 'التقرير اليومي'
};

const THEME_STORAGE_KEY = 'salon-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'صالون عبود';

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="salon-theme-shell relative flex h-screen overflow-hidden" data-theme={theme}>
      <div className="theme-grid-layer" />
      <div className="theme-ambient-layer" />
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
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
