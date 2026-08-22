import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { WorkOrder } from '../types/order';
import { mockOrders } from '../data/mockOrders';
import { storageService } from '../services/storageService';

interface OrderContextValue {
  orders: WorkOrder[];
  updateOrder: (id: string, patch: Partial<WorkOrder>) => void;
  getOrderById: (id: string) => WorkOrder | undefined;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>(() => storageService.get<WorkOrder[]>('orders', mockOrders));

  const updateOrder = (id: string, patch: Partial<WorkOrder>) => {
    setOrders((prev) => {
      const next = prev.map((order) => (order.id === id ? { ...order, ...patch } : order));
      storageService.set('orders', next);
      return next;
    });
  };

  const getOrderById = (id: string) => orders.find((order) => order.id === id);

  const value = useMemo<OrderContextValue>(
    () => ({ orders, updateOrder, getOrderById }),
    [orders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderContext(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrderContext debe usarse dentro de un OrderProvider');
  return ctx;
}
