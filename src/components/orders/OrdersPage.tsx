import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { OrderTable } from './OrderTable';
import { cn } from '../ui/cn';
import type { OrderStatus } from '../../types/order';
import { formatStatus } from '../../utils/formatters';

const STATUS_FILTERS: OrderStatus[] = ['EN_TIEMPO', 'EN_RIESGO', 'ATRASADO', 'DETENIDO'];

export function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const { orders } = useOrders({ status: statusFilter });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter(undefined)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            !statusFilter ? 'border-forge-accent text-forge-accent' : 'border-forge-border text-forge-steel hover:text-slate-100',
          )}
        >
          Todas
        </button>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === status ? 'border-forge-accent text-forge-accent' : 'border-forge-border text-forge-steel hover:text-slate-100',
            )}
          >
            {formatStatus(status)}
          </button>
        ))}
      </div>
      <OrderTable orders={orders} />
    </div>
  );
}
