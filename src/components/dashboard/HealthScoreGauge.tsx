import { motion } from 'framer-motion';

const SIZE = 168;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function colorFor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

function labelFor(score: number): string {
  if (score >= 80) return 'Planta saludable';
  if (score >= 60) return 'Requiere atención';
  if (score >= 35) return 'Riesgo elevado';
  return 'Crítico';
}

/** Anillo circular animado 0-100 que resume la salud operacional de la planta. */
export function HealthScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = colorFor(clamped);
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        <div
          className="absolute inset-2 rounded-full blur-2xl transition-colors duration-700"
          style={{ backgroundColor: color, opacity: 0.18 }}
        />
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 drop-shadow-[0_0_18px_rgba(0,0,0,0.4)]">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--color-forge-border)" strokeWidth={STROKE} />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-[2.75rem] font-bold leading-none tracking-tight"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {clamped}
          </motion.span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-forge-steel">Health Score</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />
          <span className="relative inline-flex size-1.5 rounded-full" style={{ backgroundColor: color }} />
        </span>
        <p className="text-sm font-medium" style={{ color }}>{labelFor(clamped)}</p>
      </div>
    </div>
  );
}
