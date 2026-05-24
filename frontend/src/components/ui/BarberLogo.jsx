import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

export default function BarberLogo({ size = 'md', className = '' }) {
  const sizes = {
    sm: {
      box: 'w-12 h-12 rounded-xl',
      icon: 'w-6 h-6'
    },
    md: {
      box: 'w-16 h-16 rounded-2xl',
      icon: 'w-8 h-8'
    },
    lg: {
      box: 'w-20 h-20 rounded-2xl',
      icon: 'w-10 h-10'
    }
  };

  const selected = sizes[size] || sizes.md;

  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
        rotate: [0, 4, -4, 0]
      }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`${selected.box} relative inline-flex items-center justify-center bg-gradient-to-br from-gold-600/30 to-gold-500/10 border border-gold-500/30 glow-gold ${className}`}
    >
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-1 rounded-[inherit] border border-gold-400/10"
      />
      <Scissors className={`${selected.icon} text-gold-400 relative z-10`} />
    </motion.div>
  );
}
