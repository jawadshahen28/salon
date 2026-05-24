import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ShoppingBag, LogOut,
  X, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BarberLogo from '../ui/BarberLogo';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/queue', icon: Users, label: 'إدارة الدور' },
  { to: '/add-customer', icon: Users, label: 'إضافة زبون' },
  { to: '/purchases', icon: ShoppingBag, label: 'المشتريات' }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-72 z-40 flex flex-col bg-dark-900/95 backdrop-blur-2xl border-l border-white/5 lg:relative lg:translate-x-0 lg:flex"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <BarberLogo size="sm" />
            <div>
              <h2 className="font-black text-lg text-gradient-gold">صالون عبود</h2>
              <p className="text-white/30 text-xs">نظام الإدارة</p>
            </div>
            <button
              onClick={onToggle}
              className="mr-auto text-white/30 hover:text-white transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-white/20 text-xs font-semibold px-4 mb-3 uppercase tracking-wider">القائمة الرئيسية</p>
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
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{label}</span>
              <ChevronLeft className="w-4 h-4 mr-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass-card p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-600/30 to-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <span className="text-gold-400 font-bold text-lg">
                  {user?.name?.charAt(0) || 'م'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-white">{user?.name || 'المالك'}</p>
                <p className="text-white/30 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">تسجيل الخروج</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
