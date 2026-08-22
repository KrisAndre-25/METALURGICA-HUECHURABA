import type { ReactNode } from 'react';
import { cn } from './cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Quita el padding interno, para cards que arman su propio layout (ej. tablas). */
  noPadding?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, noPadding, onClick }: CardProps) {
  const isInteractive = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-forge-border bg-forge-surface shadow-lg shadow-black/20',
        !noPadding && 'p-5',
        isInteractive && 'cursor-pointer transition-colors hover:border-forge-accent/40 active:scale-[0.99]',
        className,
      )}
    >
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
