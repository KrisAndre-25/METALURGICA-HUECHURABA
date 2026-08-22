import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { WorkOrder } from '../../types/order';
import { formatDate, formatStation } from '../../utils/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { ProgressBar } from '../ui/ProgressBar';

export function OrderCardTouch({ order, onOpen }: { order: WorkOrder; onOpen: (order: WorkOrder) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(order)}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-2xl border border-forge-border bg-forge-surface p-4 text-left active:bg-forge-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{order.projectName}</p>
          <p className="text-xs text-forge-steel">{order.id} · {order.clientName}</p>
        </div>
        <ChevronRight className="mt-0.5 size-4 shrink-0 text-forge-steel" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} />
        <OrderPriorityBadge priority={order.priority} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-forge-steel">
          <span>{formatStation(order.currentStation)}</span>
          <span>{order.progressPercentage}%</span>
        </div>
        <ProgressBar percentage={order.progressPercentage} status={order.status} />
      </div>

      <p className="mt-3 text-xs text-forge-steel">
        Comprometida {formatDate(order.promisedDate)} · {order.assignedOperator}
      </p>
    </motion.button>
  );
}
