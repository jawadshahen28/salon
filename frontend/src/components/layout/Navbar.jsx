import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Menu, Wifi } from 'lucide-react';
import BarberPoleLogo from '../ui/BarberPoleLogo';

export default function Navbar({ onToggleSidebar, title }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-20 flex min-h-16 items-center gap-4 border-b border-white/8 bg-cyber-950/70 px-4 backdrop-blur-2xl md:px-6"
    >
      <button
        onClick={onToggleSidebar}
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-all duration-300 hover:border-neon-cyan/30 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-xl font-black text-white">{title}</h1>
      </div>

      <div className="mr-auto flex items-center gap-2 md:gap-3">
        <div className="glass-card hidden items-center gap-2 px-4 py-2 md:flex">
          <Clock className="h-4 w-4 text-neon-cyan" />
          <span className="font-mono text-sm font-bold text-neon-cyan">{formatTime(time)}</span>
        </div>

        <div className="hidden items-center gap-2 text-xs text-white/40 xl:flex">
          <span>{formatDate(time)}</span>
        </div>

        <motion.button
          type="button"
          aria-label="شعار الحلاقين"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="hidden h-12 w-10 items-center justify-center rounded-xl sm:flex"
        >
          <BarberPoleLogo />
        </motion.button>

        <div className="flex items-center gap-1.5 rounded-xl border border-neon-green/25 bg-neon-green/10 px-3 py-2">
          <Wifi className="h-3.5 w-3.5 text-neon-green" />
          <span className="hidden text-xs font-black text-neon-green sm:block">متصل</span>
        </div>
      </div>
    </motion.header>
  );
}
