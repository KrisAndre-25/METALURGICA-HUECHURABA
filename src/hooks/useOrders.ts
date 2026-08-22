import { useMemo } from 'react';
import { useOrderContext } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import type { OrderStatus, Station } from '../types/order';

interface UseOrdersFilters {
  status?: OrderStatus;
  station?: Station;
  search?: string;
}

/**
 * Lista de OTs con filtros opcionales, ya acotada por rol: un CLIENT solo ve
 * las OTs de su propia empresa (`clientName`); ADMIN y OPERATOR ven todo.
 */
export function useOrders(filters: UseOrdersFilters = {}) {
  const { user } = useAuth();
  const {
    orders,
    purchaseOrders,
    shipments,
    messages,
    updateOrder,
    getOrderById,
    advanceStation,
    addNote,
    reassignOperator,
    createOrder,
    getClientProfile,
    sendMessage,
  } = useOrderContext();

  const scoped = useMemo(() => {
    if (user?.role === 'CLIENT') {
      return orders.filter((order) => order.clientName === user.clientName);
    }
    return orders;
  }, [orders, user]);

  const filtered = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    return scoped.filter((order) => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.station && order.currentStation !== filters.station) return false;
      if (search) {
        const haystack = `${order.id} ${order.projectName} ${order.clientName}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [scoped, filters.status, filters.station, filters.search]);

  return {
    orders: filtered,
    allOrders: scoped,
    purchaseOrders,
    shipments,
    messages,
    updateOrder,
    getOrderById,
    advanceStation,
    addNote,
    reassignOperator,
    createOrder,
    getClientProfile,
    sendMessage,
  };
}
