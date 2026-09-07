import { useState, type MouseEvent, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './cn';

interface LensProps {
  children: ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  hovering?: boolean;
  setHovering?: (hovering: boolean) => void;
  className?: string;
}

/**
 * Efecto lupa: al pasar el mouse, superpone una copia ampliada del contenido
 * recortada a un círculo que sigue el cursor (mismo patrón que Aceternity UI
 * `Lens`, reimplementado sin dependencias externas). `hovering`/`setHovering`
 * son opcionales — si no se pasan, el componente maneja su propio estado.
 */
export function Lens({ children, zoomFactor = 1.6, lensSize = 170, hovering, setHovering, className }: LensProps) {
  const [localHovering, setLocalHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isHovering = hovering ?? localHovering;
  const updateHovering = setHovering ?? setLocalHovering;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      className={cn('relative z-20 overflow-hidden rounded-2xl', className)}
      onMouseEnter={() => updateHovering(true)}
      onMouseLeave={() => updateHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              maskImage: `radial-gradient(circle ${lensSize / 2}px at ${mousePosition.x}px ${mousePosition.y}px, black 100%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${lensSize / 2}px at ${mousePosition.x}px ${mousePosition.y}px, black 100%, transparent 100%)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ transform: `scale(${zoomFactor})`, transformOrigin: `${mousePosition.x}px ${mousePosition.y}px` }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
