import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'gold', trend, delay = 0 }) {
  const colorClasses = {
    gold: {
      icon: 'text-gold-400',
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/20',
      glow: 'hover:shadow-gold-500/10',
      value: 'text-gold-400'
    },
    blue: {
      icon: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: 'hover:shadow-blue-500/10',
      value: 'text-blue-400'
    },
    green: {
      icon: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      glow: 'hover:shadow-green-500/10',
      value: 'text-green-400'
    },
    red: {
      icon: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      glow: 'hover:shadow-red-500/10',
      value: 'text-red-400'
    },
    purple: {
      icon: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      glow: 'hover:shadow-purple-500/10',
      value: 'text-purple-400'
    }
  };

  const c = colorClasses[color] || colorClasses.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`stat-card border ${c.border} hover:shadow-xl ${c.glow} group`}
    >
      {/* Background decoration */}
      <div className={`absolute top-0 left-0 w-32 h-32 ${c.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-black ${c.value} mb-1`}>{value}</p>
          {subtitle && <p className="text-white/30 text-xs">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}%</span>
              <span className="text-white/30">من أمس</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
