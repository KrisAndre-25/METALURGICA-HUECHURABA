import { motion } from 'framer-motion';

/** Fondo decorativo: rayos de luz cónicos rotando lentamente detrás de la card. */
export function Rays() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 opacity-40"
      style={{
        background:
          'conic-gradient(from 0deg at 50% 0%, transparent 0deg, rgba(56,189,248,0.28) 12deg, transparent 28deg, transparent 90deg, rgba(16,185,129,0.22) 105deg, transparent 122deg, transparent 200deg, rgba(59,130,246,0.2) 215deg, transparent 232deg, transparent 360deg)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    />
  );
}
