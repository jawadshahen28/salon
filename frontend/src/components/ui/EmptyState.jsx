import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
    >
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-l from-transparent via-neon-cyan/50 to-transparent" />
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[1.6rem] border border-neon-cyan/20 bg-neon-cyan/10 shadow-2xl shadow-neon-cyan/10">
        <Icon className="h-12 w-12 text-neon-cyan/70" />
      </div>
      <h3 className="mb-2 text-xl font-black text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm leading-7 text-white/38">{description}</p>
      {action && (
        <button onClick={action.onClick} className="gold-btn">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
