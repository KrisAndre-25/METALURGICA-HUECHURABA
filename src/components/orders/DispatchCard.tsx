import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck2, PackageCheck, Truck } from 'lucide-react';
import { STATION_LIST } from '../../data/mockStations';
import type { WorkOrder } from '../../types/order';
import { formatDate, formatDateTime, formatDispatchGuide } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { cn } from '../ui/cn';
import { ConformityCertificateSheet } from './ConformityCertificateSheet';

/**
 * Tarjeta de "Mis Despachos y Entregas" del portal cliente: badge destacado
 * DESPACHADO/ENTREGADO (o "Preparando despacho" si aún no sale del taller),
 * guía simulada, fecha/hora de salida y el timeline completo de las 7 estaciones.
 */
export function DispatchCard({ order }: { order: WorkOrder }) {
  const [certOpen, setCertOpen] = useState(false);
  const currentIndex = STATION_LIST.findIndex((s) => s.key === order.currentStation);
  const isDelivered = order.status === 'COMPLETADO';
  const exitEvent = order.history.find((e) => e.station === 'DESPACHO' && e.type === 'STATION_EXIT');

  return (
    <div className="rounded-2xl border border-forge-border bg-forge-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{order.projectName}</p>
          <p className="text-xs text-forge-steel">{order.id} · Guía {formatDispatchGuide(order.id)}</p>
        </div>
        <span className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide',
          isDelivered ? 'bg-forge-ok/15 text-forge-ok' : 'bg-forge-accent/15 text-forge-accent',
        )}>
          {isDelivered ? <PackageCheck className="size-3.5" /> : <Truck className="size-3.5" />}
          {isDelivered ? 'Despachado / Entregado' : 'Preparando despacho'}
        </span>
      </div>

      <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-forge-steel">Fecha comprometida</dt>
          <dd>{formatDate(order.promisedDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-forge-steel">Salida de taller</dt>
          <dd>{exitEvent ? formatDateTime(exitEvent.timestamp) : 'Aún no registrada'}</dd>
        </div>
      </dl>

      <div className="relative mt-2 px-1">
        <div className="absolute left-1 right-1 top-1.5 h-0.5 bg-forge-border" />
        <motion.div
          className="absolute left-1 top-1.5 h-0.5 bg-forge-ok"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (STATION_LIST.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 'calc(100% - 0.5rem)' }}
        />
        <div className="relative flex justify-between">
          {STATION_LIST.map((station, i) => (
            <div key={station.key} className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'size-3 rounded-full border-2 border-forge-bg',
                i <= currentIndex ? 'bg-forge-ok' : 'bg-forge-border',
              )} />
              <span className="hidden text-center text-[9px] leading-tight text-forge-steel sm:block">{station.shortLabel}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-forge-steel sm:hidden">
        Estación actual: <span className="text-slate-100">{STATION_LIST[currentIndex]?.label}</span>
      </p>

      <Button
        variant="secondary"
        fullWidth
        size="md"
        className="mt-4"
        icon={<FileCheck2 className="size-4" />}
        onClick={() => setCertOpen(true)}
      >
        Ver Ficha de Conformidad
      </Button>

      <ConformityCertificateSheet order={certOpen ? order : null} onClose={() => setCertOpen(false)} />
    </div>
  );
}
