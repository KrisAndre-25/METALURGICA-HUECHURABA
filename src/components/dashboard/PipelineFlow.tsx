import { motion } from 'framer-motion';
import type { Station } from '../../types/order';
import type { StationLoad } from '../../types/kpi';
import { STATION_META } from '../../data/mockStations';
import { cn } from '../ui/cn';

interface PipelineFlowProps {
  data: StationLoad[];
  activeStation: Station | null;
  onSelectStation: (station: Station | null) => void;
}

/** Barra horizontal deslizable de las 7 estaciones; tocar un chip filtra el resto del dashboard. */
export function PipelineFlow({ data, activeStation, onSelectStation }: PipelineFlowProps) {
  return (
    <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {data.map(({ station, orderCount }, index) => {
        const meta = STATION_META[station];
        const isActive = activeStation === station;
        return (
          <motion.button
            key={station}
            type="button"
            onClick={() => onSelectStation(isActive ? null : station)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex shrink-0 snap-start flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors',
              isActive ? 'border-forge-accent bg-forge-accent/10' : 'border-forge-border bg-forge-surface',
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-forge-steel">{index + 1}. {meta.shortLabel}</span>
            <span className={cn('text-2xl font-bold', isActive ? 'text-forge-accent' : 'text-slate-100')}>{orderCount}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
