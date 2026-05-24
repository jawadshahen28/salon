import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Clock, Wifi } from 'lucide-react';

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
      className="sticky top-0 z-20 h-16 flex items-center px-6 gap-4
        bg-dark-950/80 backdrop-blur-xl border-b border-white/5"
    >
      <button
        onClick={onToggleSidebar}
        className="text-white/50 hover:text-white transition-colors lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-xl font-black text-white">{title}</h1>
      </div>

      <div className="mr-auto flex items-center gap-3">
        {/* Live clock */}
        <div className="hidden md:flex items-center gap-2 glass-card px-4 py-2">
          <Clock className="w-4 h-4 text-gold-400" />
          <span className="text-sm font-bold text-gold-400 font-mono">{formatTime(time)}</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-white/40 text-xs">
          <span>{formatDate(time)}</span>
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-semibold hidden sm:block">متصل</span>
        </div>
      </div>
    </motion.header>
  );
}
