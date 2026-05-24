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
        rotate: [0, 3, -3, 0]
      }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`${selected.box} glow-cyan relative inline-flex items-center justify-center overflow-hidden border border-neon-cyan/30 bg-gradient-to-br from-neon-primary/22 via-neon-cyan/10 to-neon-green/10 ${className}`}
    >
      <span className="absolute inset-x-2 top-0 h-px bg-gradient-to-l from-transparent via-white/60 to-transparent" />
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-1 rounded-[inherit] border border-neon-cyan/15"
      />
      <Scissors className={`${selected.icon} relative z-10 text-neon-cyan`} />
    </motion.div>
  );
}
