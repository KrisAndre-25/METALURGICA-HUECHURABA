import { cn } from './cn';

/** Badge rojo de notificación con un contador (ej. solicitudes pendientes en la navegación). */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-forge-stopped px-1.5 py-0.5 text-[10px] font-bold leading-none text-white',
        className,
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
