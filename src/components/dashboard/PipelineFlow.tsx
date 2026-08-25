import { motion } from 'framer-motion';
import type { Station } from '../../types/order';
import type { StationLoad } from '../../types/kpi';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatStationShort } from '../../utils/formatters';
import { cn } from '../ui/cn';

interface PipelineFlowProps {
  data: StationLoad[];
  activeStation: Station | null;
  onSelectStation: (station: Station | null) => void;
}

/** Barra horizontal deslizable de las 7 estaciones; tocar un chip filtra el resto del dashboard. */
export function PipelineFlow({ data, activeStation, onSelectStation }: PipelineFlowProps) {
  const { language } = useUiPrefs();
  const maxCount = Math.max(...data.map((d) => d.orderCount), 1);

  return (
    <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {data.map(({ station, orderCount }, index) => {
        const isActive = activeStation === station;
        const loadRatio = orderCount / maxCount;
        const isBottleneck = orderCount >= 3;
        return (
          <motion.button
            key={station}
            type="button"
            onClick={() => onSelectStation(isActive ? null : station)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'relative flex w-[92px] shrink-0 snap-start flex-col gap-2 overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-colors',
              isActive
                ? 'border-forge-accent bg-gradient-to-br from-forge-accent/20 to-forge-accent/5 shadow-[0_0_0_1px_var(--color-forge-accent)]'
                : 'border-forge-border bg-forge-surface hover:border-forge-accent/30',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                isActive ? 'bg-forge-accent text-white' : 'bg-forge-surface-2 text-forge-steel',
              )}>
                {index + 1}
              </span>
              {isBottleneck && <span className="size-1.5 rounded-full bg-forge-warn" />}
            </div>
            <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-forge-steel">{formatStationShort(station, language)}</span>
            <span className={cn('text-2xl font-bold leading-none', isActive ? 'text-forge-accent' : 'text-slate-100')}>{orderCount}</span>
            <div className="h-1 w-full overflow-hidden rounded-full bg-forge-border/80">
              <motion.div
                className={cn('h-full rounded-full', isActive ? 'bg-forge-accent' : 'bg-forge-steel/50')}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(loadRatio * 100, orderCount > 0 ? 12 : 0)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
