import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

interface SquigglyTextProps {
  children: ReactNode;
  className?: string;
  /** Intervalo en ms entre cada frame de turbulencia — más bajo = ondulación más rápida. */
  stepDuration?: number;
  /** Intensidad del desplazamiento del filtro SVG. */
  scale?: number;
}

const FREQUENCIES = ['0.02 0.05', '0.04 0.03', '0.03 0.06', '0.01 0.04', '0.05 0.02'];

/**
 * Texto con ondulación en vivo vía filtro SVG `feTurbulence` + `feDisplacementMap`,
 * ciclando `baseFrequency` en un intervalo — estilo Aceternity `SquigglyText`,
 * reimplementado sin el paquete original (no existe en npm).
 */
export function SquigglyText({ children, className, stepDuration = 70, scale = 5 }: SquigglyTextProps) {
  const rawId = useId();
  const filterId = `squiggly-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [baseFrequency, setBaseFrequency] = useState(FREQUENCIES[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % FREQUENCIES.length;
      setBaseFrequency(FREQUENCIES[index]);
    }, stepDuration);
    return () => clearInterval(interval);
  }, [stepDuration]);

  return (
    <span className={cn('relative inline-block', className)}>
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={1} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <span style={{ filter: `url(#${filterId})` }}>{children}</span>
    </span>
  );
}
