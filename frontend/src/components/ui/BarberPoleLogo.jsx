import { motion } from 'framer-motion';

export default function BarberPoleLogo({ className = '' }) {
  return (
    <motion.div
      aria-hidden="true"
      animate={{
        y: [0, -1.5, 0],
        rotate: [0, 0.8, -0.8, 0]
      }}
      transition={{
        duration: 3.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={`relative inline-flex h-12 w-8 items-center justify-center ${className}`}
    >
      <span className="absolute top-0 z-0 h-2.5 w-6 rounded-t-full rounded-b-md border border-white/25 bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-700 shadow-inner" />
      <span className="absolute bottom-0 z-0 h-2.5 w-6 rounded-b-full rounded-t-md border border-white/25 bg-gradient-to-t from-zinc-300 via-zinc-500 to-zinc-700 shadow-inner" />

      <span className="relative z-10 h-9 w-5 overflow-hidden rounded-[0.18rem] border border-white/65 bg-white shadow-[0_0_16px_rgba(0,209,255,0.2)]">
        <motion.span
          className="absolute inset-[-0.75rem]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #d4142f 0 8px, #f8fafc 8px 19px, #233a98 19px 27px, #f8fafc 27px 38px)',
            backgroundSize: '54px 54px'
          }}
          animate={{ backgroundPosition: ['0px 0px', '0px 54px'] }}
          transition={{
            duration: 1.45,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <span className="absolute inset-y-0 right-1 w-1 rounded-full bg-white/45 blur-[1px]" />
        <span className="absolute inset-y-0 left-0 w-px bg-black/25" />
        <span className="absolute inset-0 rounded-[inherit] border border-black/25" />
      </span>
    </motion.div>
  );
}
