import { motion } from 'framer-motion';
import { cn } from '../ui/cn';
import './heroShowcase.css';

interface Shot {
  src: string;
  alt: string;
}

function Phone({ shot, className }: { shot: Shot; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-[30px] border-[5px] border-slate-800 bg-slate-950 shadow-2xl shadow-black/60', className)}>
      <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
      <img src={shot.src} alt={shot.alt} loading="eager" className="block h-full w-full object-cover object-top" draggable={false} />
    </div>
  );
}

/**
 * Vista previa del producto en el hero: tres teléfonos en abanico con capturas
 * reales de la app, asomando desde el borde inferior con un resplandor de marca.
 * El flotado es CSS (heroShowcase.css) y se pausa fuera de pantalla (data-offscreen).
 */
export function HeroShowcase({ shots }: { shots: [Shot, Shot, Shot] }) {
  const [left, center, right] = shots;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
      className="hero-showcase relative mx-auto mt-0 h-[400px] w-full max-w-6xl sm:h-[500px]"
      aria-hidden
    >
      {/* Resplandor de marca detrás de los teléfonos. */}
      <div className="absolute left-1/2 top-32 h-72 w-[55%] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/30 via-cyan-500/30 to-[#10B981]/30 blur-[90px]" />

      <div className="hero-float-slow absolute left-1/2 top-40 hidden w-[200px] -translate-x-[135%] sm:block">
        <Phone shot={left} className="h-[420px] -rotate-[9deg] opacity-80" />
      </div>
      <div className="hero-float-slow absolute left-1/2 top-40 hidden w-[200px] translate-x-[35%] [animation-delay:-3s] sm:block">
        <Phone shot={right} className="h-[420px] rotate-[9deg] opacity-80" />
      </div>
      <div className="hero-float absolute left-1/2 top-24 w-[210px] -translate-x-1/2 sm:w-[230px]">
        <Phone shot={center} className="h-[440px] ring-1 ring-cyan-400/30 sm:h-[480px]" />
      </div>
    </motion.div>
  );
}
