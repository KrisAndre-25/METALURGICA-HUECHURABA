import { useMemo } from 'react';
import { useOrderContext } from '../contexts/OrderContext';
import type { OrderStatus, Station } from '../types/order';

interface UseOrdersFilters {
  status?: OrderStatus;
  station?: Station;
}

/** Lista de OTs con filtros opcionales por estado y estación, memoizada. */
export function useOrders(filters: UseOrdersFilters = {}) {
  const { orders, updateOrder, getOrderById } = useOrderContext();

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.station && order.currentStation !== filters.station) return false;
      return true;
    });
  }, [orders, filters.status, filters.station]);

  return { orders: filtered, allOrders: orders, updateOrder, getOrderById };
}
