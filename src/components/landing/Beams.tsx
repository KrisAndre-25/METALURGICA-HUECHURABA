import { motion } from 'framer-motion';

/** Fondo decorativo: haces de luz difusos desplazándose horizontalmente detrás de la card. */
export function Beams() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -inset-y-10 left-1/4 w-1/3 rotate-12 bg-gradient-to-b from-transparent via-cyan-400/25 to-transparent blur-2xl"
        animate={{ x: ['-30%', '30%', '-30%'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -inset-y-10 left-2/3 w-1/4 -rotate-12 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent blur-2xl"
        animate={{ x: ['30%', '-30%', '30%'] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
