import type { ReactNode } from 'react';
import { cn } from './cn';

type AccentTone = 'accent' | 'ok' | 'warn' | 'risk' | 'stopped';

const ACCENT_GRADIENT: Record<AccentTone, string> = {
  accent: 'from-forge-accent via-forge-accent/60 to-transparent',
  ok: 'from-forge-ok via-forge-ok/60 to-transparent',
  warn: 'from-forge-warn via-forge-warn/60 to-transparent',
  risk: 'from-forge-risk via-forge-risk/60 to-transparent',
  stopped: 'from-forge-stopped via-forge-stopped/60 to-transparent',
};

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Quita el padding interno, para cards que arman su propio layout (ej. tablas). */
  noPadding?: boolean;
  onClick?: () => void;
  /** Barra de degradado de 2px arriba del card — reservado para tarjetas "hero" del dashboard. */
  accent?: AccentTone;
}

export function Card({ children, className, noPadding, onClick, accent }: CardProps) {
  const isInteractive = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border border-forge-border bg-forge-surface shadow-lg shadow-black/20',
        !noPadding && 'p-5',
        isInteractive && 'cursor-pointer transition-colors hover:border-forge-accent/40 active:scale-[0.99]',
        className,
      )}
    >
      {accent && <span className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', ACCENT_GRADIENT[accent])} />}
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold uppercase tracking-wide text-forge-steel', className)}>{children}</h3>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-4 border-t border-forge-border pt-4', className)}>{children}</div>;
}
