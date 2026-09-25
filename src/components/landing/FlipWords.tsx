import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useInViewport } from '../../hooks/useInViewport';
import { cn } from '../ui/cn';

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

/**
 * Palabra animada inline que rota dentro de un titular — estilo Aceternity
 * UI `FlipWords`, reimplementado con Framer Motion (ya es dependencia del
 * proyecto) en vez de copiar el paquete completo. Sin píldora/borde: es
 * texto suelto que hereda el tamaño de fuente del titular que la envuelve.
 */
export function FlipWords({ words, duration = 2200, className }: FlipWordsProps) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInViewport(ref);

  // Solo rota mientras está en pantalla.
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), duration);
    return () => clearInterval(id);
  }, [words.length, duration, inView]);

  return (
    <span ref={ref} className="relative inline-block" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={cn('inline-block', className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
