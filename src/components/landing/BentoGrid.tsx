import type { ReactNode } from 'react';
import { cn } from '../ui/cn';

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2', className)}>{children}</div>;
}

interface BentoCardProps {
  title: string;
  description: string;
  /** Visual decorativo (marquee, lista animada, beam, calendario) detrás del texto. */
  background: ReactNode;
  className?: string;
}

/**
 * Tarjeta bento: el `background` ocupa toda la tarjeta con opacidad reducida
 * y una máscara de degradado hacia abajo, con el título/descripción
 * superpuestos — mismo patrón que Aceternity/Magic UI `BentoCard`, con
 * superficie glassmorphism y borde azul eléctrico que se ilumina al hover.
 */
export function BentoCard({ title, description, background, className }: BentoCardProps) {
  return (
    <div
      className={cn(
        'group relative h-80 overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/80 backdrop-blur-sm',
        'transition-colors hover:border-blue-500/50',
        className,
      )}
    >
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_35%,transparent_92%)]">{background}</div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-5 pt-14">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{description}</p>
      </div>
    </div>
  );
}
