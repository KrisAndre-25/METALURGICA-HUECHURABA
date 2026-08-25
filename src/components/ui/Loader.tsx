import { cn } from './cn';

export type LoaderSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<LoaderSize, string> = {
  sm: 'uiverse-loader--sm',
  md: 'uiverse-loader--md',
  lg: 'uiverse-loader--lg',
};

interface LoaderProps {
  /** sm = dentro de un botón/línea de texto; md = standalone en una card; lg = pantalla completa. */
  size?: LoaderSize;
  /** Cubre el viewport con un overlay y centra el loader — para transiciones pesadas (ej. tras el login). */
  fullScreen?: boolean;
  className?: string;
  /**
   * Texto de estado accesible. Sin `label`, el loader es puramente
   * decorativo (`aria-hidden`) — pensado para ir DENTRO de un control que
   * ya comunica su propio estado (ej. `Button` con `aria-busy`). Con
   * `label`, se anuncia como `role="status"` y, en `fullScreen`, también
   * se muestra como texto visible bajo el loader.
   */
  label?: string;
}

/**
 * Loader "matrix" estilo Uiverse.io: reemplaza los spinners genéricos
 * (`Loader2` + `animate-spin`) del sistema. Hereda `currentColor` — se
 * adapta automáticamente al texto del botón donde se inserte, y a
 * amarillo neón en modo alto contraste (ver `.uiverse-loader` en
 * `index.css`) sin necesidad de una prop de color.
 */
export function Loader({ size = 'md', fullScreen, className, label }: LoaderProps) {
  const a11yProps = label ? { role: 'status' as const, 'aria-label': label } : { 'aria-hidden': true as const };
  const spinner = <span {...a11yProps} className={cn('uiverse-loader', SIZE_CLASSES[size], className)} />;

  if (!fullScreen) return spinner;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-3 bg-forge-bg/85 text-forge-accent backdrop-blur-sm">
      {spinner}
      {label && <p className="text-xs font-medium text-forge-steel">{label}</p>}
    </div>
  );
}
