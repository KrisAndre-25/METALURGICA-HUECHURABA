import type { ReactNode } from 'react';
import { cn } from './cn';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-forge-border bg-forge-surface p-5 shadow-lg shadow-black/20', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-semibold uppercase tracking-wide text-forge-steel', className)}>{children}</h3>;
}
