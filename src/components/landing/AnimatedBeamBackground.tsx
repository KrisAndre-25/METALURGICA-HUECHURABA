import { IconCpu, IconDatabase, IconTower } from '@tabler/icons-react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

function Node({ icon: Icon, label, className }: { icon: typeof IconCpu; label: string; className: string }) {
  return (
    <div className={`absolute flex flex-col items-center gap-1.5 ${className}`}>
      <div className="flex size-11 items-center justify-center rounded-full border border-blue-900/40 bg-black/70 shadow-lg shadow-black/30">
        <Icon className="size-5 text-blue-400" />
      </div>
      <span className="text-[10px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

/** Beam animado: dos líneas SVG con flujo de "datos" (stroke-dasharray en movimiento) convergiendo en la Torre de Control. */
export function AnimatedBeamBackground() {
  const { language } = useLandingLanguage();
  return (
    <div className="relative h-full w-full pt-6">
      <svg viewBox="0 0 300 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <path d="M 60 40 C 60 100, 150 100, 150 140" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth={2} />
        <path d="M 240 40 C 240 100, 150 100, 150 140" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth={2} />
        <path
          d="M 60 40 C 60 100, 150 100, 150 140"
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="8 220"
          className="animate-beam-flow"
        />
        <path
          d="M 240 40 C 240 100, 150 100, 150 140"
          fill="none"
          stroke="#06B6D4"
          strokeWidth={2}
          strokeDasharray="8 220"
          className="animate-beam-flow-delayed"
        />
      </svg>

      <Node icon={IconCpu} label={language === 'es' ? 'Sensores PLC' : 'PLC Sensors'} className="left-[10%] top-[16%]" />
      <Node icon={IconDatabase} label="ERP" className="right-[10%] top-[16%]" />
      <Node icon={IconTower} label={language === 'es' ? 'Torre DMAIX' : 'DMAIX Tower'} className="bottom-[8%] left-1/2 -translate-x-1/2" />
    </div>
  );
}
