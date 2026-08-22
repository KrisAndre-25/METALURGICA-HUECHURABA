import { motion } from 'framer-motion';
import { PackageCheck } from 'lucide-react';
import { STATION_LIST } from '../../data/mockStations';
import type { WorkOrder } from '../../types/order';
import { formatDate } from '../../utils/formatters';

/** Vista "tracking de envío": solo % de avance, estación actual y fecha comprometida. Sin datos internos. */
export function ClientTrackingCard({ order }: { order: WorkOrder }) {
  const currentIndex = STATION_LIST.findIndex((s) => s.key === order.currentStation);
  const isDone = order.status === 'COMPLETADO';

  return (
    <div className="rounded-2xl border border-forge-border bg-forge-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{order.projectName}</p>
          <p className="text-xs text-forge-steel">{order.id}</p>
        </div>
        {isDone && <PackageCheck className="size-6 text-forge-ok" />}
      </div>

      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-3xl font-bold text-forge-accent">{order.progressPercentage}%</span>
        <span className="text-sm text-forge-steel">Comprometida {formatDate(order.promisedDate)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-forge-border">
        <motion.div
          className="h-full rounded-full bg-forge-accent"
          initial={{ width: 0 }}
          animate={{ width: `${order.progressPercentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="relative mt-6 px-1">
        <div className="absolute left-1 right-1 top-1.5 h-0.5 bg-forge-border" />
        <motion.div
          className="absolute left-1 top-1.5 h-0.5 bg-forge-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (STATION_LIST.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 'calc(100% - 0.5rem)' }}
        />
        <div className="relative flex justify-between">
          {STATION_LIST.map((station, i) => (
            <div key={station.key} className="flex flex-col items-center gap-1.5">
              <div className={`size-3 rounded-full border-2 border-forge-bg ${i <= currentIndex ? 'bg-forge-accent' : 'bg-forge-border'}`} />
              <span className="hidden text-[10px] text-forge-steel sm:block">{station.shortLabel}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-forge-steel sm:hidden">
        Estación actual: <span className="text-slate-100">{STATION_LIST[currentIndex]?.label}</span>
      </p>
    </div>
  );
}
