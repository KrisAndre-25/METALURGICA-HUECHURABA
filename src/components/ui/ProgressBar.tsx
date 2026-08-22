import { cn } from './cn';

const TONE_BAR: Record<string, string> = {
  EN_TIEMPO: 'bg-forge-ok',
  EN_RIESGO: 'bg-forge-warn',
  ATRASADO: 'bg-forge-risk',
  DETENIDO: 'bg-forge-stopped',
};

export function ProgressBar({ percentage, status }: { percentage: number; status: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-forge-border">
      <div
        className={cn('h-full rounded-full transition-all', TONE_BAR[status] ?? 'bg-forge-steel')}
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      />
    </div>
  );
}
