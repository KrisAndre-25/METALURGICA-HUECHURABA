import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { STATIONS, type ProductSpecs, type Priority, type Station, type TraceabilityEvent, type WorkOrder } from '../types/order';
import { mockOrders } from '../data/mockOrders';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'orders.v2';

function isValidOrders(value: unknown): value is WorkOrder[] {
  return Array.isArray(value) && value.every((o) => typeof o === 'object' && o !== null && 'history' in o && Array.isArray((o as WorkOrder).history));
}

export interface NewOrderInput {
  purchaseOrderId: string;
  clientName: string;
  projectName: string;
  productSpecs: ProductSpecs;
  promisedDate: string;
  priority: Priority;
}

interface OrderContextValue {
  orders: WorkOrder[];
  updateOrder: (id: string, patch: Partial<WorkOrder>) => void;
  getOrderById: (id: string) => WorkOrder | undefined;
  advanceStation: (id: string, actor: string, note?: string) => void;
  addNote: (id: string, actor: string, note: string) => void;
  reassignOperator: (id: string, operator: string, actor: string) => void;
  createOrder: (input: NewOrderInput, actor: string) => WorkOrder;
}

const OrderContext = createContext<OrderContextValue | null>(null);

function withEvent(order: WorkOrder, event: Omit<TraceabilityEvent, 'id'>): WorkOrder {
  const id = `${order.id}-ev-${order.history.length + 1}-${Date.now()}`;
  return { ...order, history: [...order.history, { ...event, id }], lastMovementAt: event.timestamp };
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const stored = storageService.get<WorkOrder[] | null>(STORAGE_KEY, null);
    return isValidOrders(stored) ? stored : mockOrders;
  });

  const persist = (next: WorkOrder[]) => {
    storageService.set(STORAGE_KEY, next);
    return next;
  };

  const updateOrder = (id: string, patch: Partial<WorkOrder>) => {
    setOrders((prev) => persist(prev.map((order) => (order.id === id ? { ...order, ...patch } : order))));
  };

  const getOrderById = (id: string) => orders.find((order) => order.id === id);

  /** Avanza la OT a la siguiente estación del pipeline, o la marca COMPLETADO si sale de Despacho. */
  const advanceStation = (id: string, actor: string, note?: string) => {
    setOrders((prev) => persist(prev.map((order) => {
      if (order.id !== id) return order;
      const now = new Date().toISOString();
      const currentIndex = STATIONS.indexOf(order.currentStation);
      let next = withEvent(order, { type: 'STATION_EXIT', station: order.currentStation, timestamp: now, actor, note });

      if (currentIndex >= STATIONS.length - 1) {
        return { ...next, status: 'COMPLETADO', progressPercentage: 100 };
      }

      const nextStation: Station = STATIONS[currentIndex + 1];
      next = withEvent(next, { type: 'STATION_ENTER', station: nextStation, timestamp: now, actor });
      const progressPercentage = Math.min(Math.round(((currentIndex + 1) / STATIONS.length) * 100 + 5), 99);
      return {
        ...next,
        currentStation: nextStation,
        status: next.status === 'DETENIDO' ? 'EN_RIESGO' : next.status,
        progressPercentage,
      };
    })));
  };

  const addNote = (id: string, actor: string, note: string) => {
    setOrders((prev) => persist(prev.map((order) => {
      if (order.id !== id) return order;
      return withEvent(order, { type: 'NOTE', station: order.currentStation, timestamp: new Date().toISOString(), actor, note });
    })));
  };

  const reassignOperator = (id: string, operator: string, actor: string) => {
    setOrders((prev) => persist(prev.map((order) => {
      if (order.id !== id) return order;
      const withEv = withEvent(order, {
        type: 'REASSIGNMENT',
        station: order.currentStation,
        timestamp: new Date().toISOString(),
        actor,
        note: `Reasignado a ${operator}`,
      });
      return { ...withEv, assignedOperator: operator };
    })));
  };

  const createOrder = (input: NewOrderInput, actor: string): WorkOrder => {
    const now = new Date().toISOString();
    const sequence = orders.length + 1042;
    const newOrder: WorkOrder = {
      id: `OT-${sequence}`,
      purchaseOrderId: input.purchaseOrderId,
      clientName: input.clientName,
      projectName: input.projectName,
      productSpecs: input.productSpecs,
      orderDate: now,
      promisedDate: input.promisedDate,
      priority: input.priority,
      currentStation: 'ORDEN_COMPRA',
      status: 'EN_TIEMPO',
      progressPercentage: 5,
      assignedOperator: actor,
      lastMovementAt: now,
      history: [{ id: `${sequence}-ev-1`, type: 'STATION_ENTER', station: 'ORDEN_COMPRA', timestamp: now, actor }],
    };
    setOrders((prev) => persist([newOrder, ...prev]));
    return newOrder;
  };

  const value = useMemo<OrderContextValue>(
    () => ({ orders, updateOrder, getOrderById, advanceStation, addNote, reassignOperator, createOrder }),
    [orders],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderContext(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrderContext debe usarse dentro de un OrderProvider');
  return ctx;
}
