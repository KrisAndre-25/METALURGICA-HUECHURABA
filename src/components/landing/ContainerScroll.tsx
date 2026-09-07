import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

interface ContainerScrollProps {
  titleComponent: ReactNode;
  children: ReactNode;
}

/**
 * Contenedor con efecto de perspectiva 3D que se "endereza" al entrar en
 * viewport — estilo Aceternity `ContainerScroll`, reimplementado con un
 * `MotionValue` manual en vez de `useScroll` de Framer Motion, porque ese
 * hook asume que `window` es el elemento que scrollea; acá el scroll real
 * ocurre en el contenedor `snap-y` custom de `Home.tsx`, así que se ubica
 * ese ancestro a mano (mismo patrón que `LandingNavbar`).
 */
export function ContainerScroll({ titleComponent, children }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const rotateX = useTransform(progress, [0, 1], [18, 0]);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  const translateY = useTransform(progress, [0, 1], [50, 0]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollEl = el.closest('.snap-y') as HTMLElement | null;
    if (!scrollEl) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = scrollEl.clientHeight || window.innerHeight;
      // 0 cuando el contenedor recién entra por abajo del viewport, 1 cuando su parte superior ya casi llega al tope.
      const raw = 1 - Math.min(Math.max(rect.top / viewportH, 0), 1);
      progress.set(raw);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, [progress]);

  return (
    <div ref={containerRef} className="relative flex w-full flex-col items-center" style={{ perspective: '1400px' }}>
      <div className="mb-6 w-full px-4">{titleComponent}</div>
      <motion.div style={{ rotateX, scale, y: translateY }} className="w-full">
        {children}
      </motion.div>
    </div>
  );
}
