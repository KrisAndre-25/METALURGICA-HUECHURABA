import { motion } from 'framer-motion';

const SIZE = 160;
const STROKE = 14;
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
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
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
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {clamped}
          </motion.span>
          <span className="text-xs text-forge-steel">/ 100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium" style={{ color }}>{labelFor(clamped)}</p>
    </div>
  );
}
