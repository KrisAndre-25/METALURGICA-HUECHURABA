import type { ReactNode } from 'react';
import { cn } from './cn';

type BadgeTone = 'ok' | 'warn' | 'risk' | 'stopped' | 'neutral' | 'accent';

const TONE_CLASSES: Record<BadgeTone, string> = {
  ok: 'bg-forge-ok/15 text-forge-ok border-forge-ok/30',
  warn: 'bg-forge-warn/15 text-forge-warn border-forge-warn/30',
  risk: 'bg-forge-risk/15 text-forge-risk border-forge-risk/30',
  stopped: 'bg-forge-stopped/15 text-forge-stopped border-forge-stopped/30',
  neutral: 'bg-forge-steel/15 text-forge-steel border-forge-steel/30',
  accent: 'bg-forge-accent/15 text-forge-accent border-forge-accent/30',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}
