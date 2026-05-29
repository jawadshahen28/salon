import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, LayoutDashboard, Users, ShoppingBag, LogOut,
  X, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BarberLogo from '../ui/BarberLogo';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/queue', icon: Users, label: 'إدارة الدور' },
  { to: '/add-customer', icon: Users, label: 'إضافة زبون' },
  { to: '/purchases', icon: ShoppingBag, label: 'المشتريات' },
  { to: '/daily-report', icon: FileText, label: 'التقرير اليومي' }
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  const handleNavClick = (to) => {
    if (to === '/') {
      window.dispatchEvent(new Event('dashboard-lock'));
    }

    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="theme-mobile-overlay fixed inset-0 z-30 bg-cyber-950/75 backdrop-blur-xl lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="theme-sidebar fixed right-0 top-0 z-40 flex h-full w-72 flex-col border-l border-white/8 bg-cyber-950/72 backdrop-blur-2xl lg:relative lg:translate-x-0 lg:flex"
      >
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-neon-cyan/35 to-transparent" />

        <div className="border-b border-white/8 p-6">
          <div className="flex items-center gap-3">
            <BarberLogo size="sm" />
            <div>
              <h2 className="text-lg font-black text-gradient-cyber">صالون عبود</h2>
              <p className="text-xs text-white/32">نظام الإدارة الذكي</p>
            </div>
            <button
              onClick={onToggle}
              className="mr-auto rounded-xl border border-white/10 bg-white/5 p-2 text-white/35 transition-all duration-300 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-4 text-[11px] font-black uppercase text-white/22">القائمة الرئيسية</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => handleNavClick(to)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-bold">{label}</span>
              <ChevronLeft className="mr-auto h-4 w-4 opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="glass-card mb-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-gold/25 bg-neon-gold/10">
                <span className="text-lg font-black text-neon-gold">
                  {user?.name?.charAt(0) || 'م'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white">{user?.name || 'المالك'}</p>
                <p className="truncate text-xs text-white/32">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-neon-danger/15 bg-neon-danger/8 px-4 py-3 text-neon-danger/75 transition-all duration-300 hover:border-neon-danger/30 hover:bg-neon-danger/14 hover:text-neon-danger"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-bold">تسجيل الخروج</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
