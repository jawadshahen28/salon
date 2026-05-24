import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 rounded-2xl bg-gold-500/5 border border-gold-500/10 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-gold-500/30" />
      </div>
      <h3 className="text-xl font-black text-white/50 mb-2">{title}</h3>
      <p className="text-white/25 text-sm max-w-xs mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="gold-btn">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
