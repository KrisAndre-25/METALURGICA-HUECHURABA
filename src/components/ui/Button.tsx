import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-forge-accent text-white hover:opacity-90 active:opacity-80',
  secondary: 'bg-forge-surface-2 text-slate-100 border border-forge-border hover:border-forge-accent/50',
  ghost: 'bg-transparent text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
  danger: 'bg-forge-stopped/15 text-forge-stopped border border-forge-stopped/30 hover:bg-forge-stopped/25',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-5 text-base',
  xl: 'h-20 px-6 text-lg',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

/** Botón táctil: alturas grandes por defecto (44px+) para uso cómodo con el dedo. */
export function Button({ variant = 'primary', size = 'md', icon, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-colors active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
