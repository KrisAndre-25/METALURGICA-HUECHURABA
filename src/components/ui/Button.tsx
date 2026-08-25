import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-forge-accent text-white hover:bg-forge-accent/90',
  secondary: 'bg-forge-surface-2 text-slate-100 border border-forge-border hover:border-forge-accent/50',
  outline: 'bg-transparent text-slate-100 border border-forge-border hover:bg-forge-surface-2',
  ghost: 'bg-transparent text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
  danger: 'bg-forge-stopped/15 text-forge-stopped border border-forge-stopped/30 hover:bg-forge-stopped/25',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-5 text-base',
  xl: 'h-20 px-6 text-lg',
};

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

/** Botón táctil del design system: variantes, tamaños grandes (44px+) y microinteracciones. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.12 }}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold outline-none transition-colors',
        'focus-visible:ring-2 focus-visible:ring-forge-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forge-bg',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'high-contrast:font-bold high-contrast:ring-2 high-contrast:ring-white/40 high-contrast:ring-offset-1',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
