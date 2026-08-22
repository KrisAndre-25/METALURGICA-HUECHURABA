import { useState } from 'react';
import type { WorkOrder } from '../../types/order';
import { formatDate, formatStation } from '../../utils/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { OrderDetailModal } from './OrderDetailModal';

export function OrderTable({ orders }: { orders: WorkOrder[] }) {
  const [selected, setSelected] = useState<WorkOrder | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-forge-border bg-forge-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-forge-border text-xs uppercase tracking-wide text-forge-steel">
            <th className="px-4 py-3 font-medium">OT / Proyecto</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Estación actual</th>
            <th className="px-4 py-3 font-medium">Prioridad</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Avance</th>
            <th className="px-4 py-3 font-medium">Fecha comprometida</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => setSelected(order)}
              className="cursor-pointer border-b border-forge-border/60 transition-colors last:border-0 hover:bg-forge-surface-2"
            >
              <td className="px-4 py-3">
                <p className="font-medium">{order.projectName}</p>
                <p className="text-xs text-forge-steel">{order.id}</p>
              </td>
              <td className="px-4 py-3 text-forge-steel">{order.clientName}</td>
              <td className="px-4 py-3">{formatStation(order.currentStation)}</td>
              <td className="px-4 py-3"><OrderPriorityBadge priority={order.priority} /></td>
              <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-20"><ProgressBar percentage={order.progressPercentage} status={order.status} /></div>
                  <span className="text-xs text-forge-steel">{order.progressPercentage}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-forge-steel">{formatDate(order.promisedDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
