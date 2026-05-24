import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'gold', trend, delay = 0 }) {
  const colorClasses = {
    gold: {
      icon: 'text-neon-gold',
      bg: 'bg-neon-gold/10',
      border: 'border-neon-gold/25',
      glow: 'hover:shadow-neon-gold/15',
      value: 'text-neon-gold'
    },
    blue: {
      icon: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/25',
      glow: 'hover:shadow-neon-cyan/15',
      value: 'text-neon-cyan'
    },
    green: {
      icon: 'text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/25',
      glow: 'hover:shadow-neon-green/15',
      value: 'text-neon-green'
    },
    red: {
      icon: 'text-neon-danger',
      bg: 'bg-neon-danger/10',
      border: 'border-neon-danger/25',
      glow: 'hover:shadow-neon-danger/15',
      value: 'text-neon-danger'
    },
    purple: {
      icon: 'text-neon-primary',
      bg: 'bg-neon-primary/10',
      border: 'border-neon-primary/25',
      glow: 'hover:shadow-neon-primary/15',
      value: 'text-neon-primary'
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
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-white/30 to-transparent opacity-70" />
      <div className={`absolute -left-8 -top-8 h-28 w-28 ${c.bg} blur-3xl opacity-55 transition-opacity duration-500 group-hover:opacity-80`} />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-black uppercase text-white/38">{title}</p>
          <p className={`mb-1 truncate text-3xl font-black ${c.value}`}>{value}</p>
          {subtitle && <p className="text-xs leading-5 text-white/30">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-neon-green' : 'text-neon-danger'}`}>
              <span>{trend >= 0 ? '+' : '-'}</span>
              <span>{Math.abs(trend)}%</span>
              <span className="text-white/30">من أمس</span>
            </div>
          )}
        </div>
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${c.border} ${c.bg} shadow-lg shadow-black/20`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
