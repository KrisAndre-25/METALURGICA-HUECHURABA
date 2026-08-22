import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { WorkOrder } from '../../types/order';
import { formatDate, formatHours, formatStation, formatTons } from '../../utils/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderPriorityBadge } from './OrderPriorityBadge';

export function OrderDetailModal({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-forge-border bg-forge-surface p-6"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs text-forge-steel">{order.id} · {order.purchaseOrderId}</p>
                <h2 className="text-lg font-semibold">{order.projectName}</h2>
                <p className="text-sm text-forge-steel">{order.clientName}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100">
                <X className="size-5" />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <OrderPriorityBadge priority={order.priority} />
            </div>

            <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-forge-steel">Estructura</dt><dd>{order.productSpecs.structureType}</dd></div>
              <div><dt className="text-forge-steel">Dimensiones</dt><dd>{order.productSpecs.dimensions}</dd></div>
              <div><dt className="text-forge-steel">Peso</dt><dd>{formatTons(order.productSpecs.weightTons)}</dd></div>
              <div><dt className="text-forge-steel">Pintura</dt><dd>{order.productSpecs.paintSpecification}</dd></div>
              <div><dt className="text-forge-steel">Fecha de orden</dt><dd>{formatDate(order.orderDate)}</dd></div>
              <div><dt className="text-forge-steel">Fecha comprometida</dt><dd>{formatDate(order.promisedDate)}</dd></div>
            </dl>

            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forge-steel">Historial por estación</h3>
            <ol className="space-y-2 border-l border-forge-border pl-4">
              {order.history.map((entry) => (
                <li key={entry.station} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-forge-accent" />
                  <p className="font-medium">{formatStation(entry.station)}</p>
                  <p className="text-xs text-forge-steel">
                    {entry.responsible} · est. {formatHours(entry.estimatedHours)} · real {formatHours(entry.actualHours)}
                  </p>
                  {entry.notes && <p className="text-xs text-forge-risk">{entry.notes}</p>}
                </li>
              ))}
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
