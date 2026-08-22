import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STATIONS, type ProductSpecs, type Priority, type PurchaseOrder, type Station, type TraceabilityEvent, type WorkOrder } from '../types/order';
import type { ChatMessage } from '../types/chat';
import type { UserRole } from '../types/user';
import { mockDataService } from '../services/mockDataService';
import { storageService } from '../services/storageService';

const ORDERS_KEY = 'orders.v4';
const PURCHASE_ORDERS_KEY = 'purchaseOrders.v1';
const MESSAGES_KEY = 'messages.v1';

const VALID_STATUSES = new Set(['EN_TIEMPO', 'EN_RIESGO', 'ATRASADO', 'DETENIDO', 'COMPLETADO']);
const VALID_PRIORITIES = new Set(['BAJA', 'NORMAL', 'ALTA', 'URGENTE']);
const VALID_ROLES = new Set(['ADMIN', 'OPERATOR', 'CLIENT']);

/**
 * Valida la FORMA real de los datos, no solo que existan. Antes el historial no
 * traía `actorRole` (esquema `orders.v3`); si algo no calza, se descarta TODO el
 * caché y se recarga desde `mockDataService` en vez de arriesgar un render con
 * datos a medio adaptar — eso es lo que deja la pantalla en negro.
 */
function isValidOrders(value: unknown): value is WorkOrder[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((raw) => {
    if (typeof raw !== 'object' || raw === null) return false;
    const o = raw as Partial<WorkOrder>;
    if (!VALID_STATUSES.has(o.status as string)) return false;
    if (!VALID_PRIORITIES.has(o.priority as string)) return false;
    if (!o.productSpecs || typeof o.productSpecs.weightTons !== 'number') return false;
    if (!Array.isArray(o.history)) return false;
    return o.history.every((e) => typeof e === 'object' && e !== null && 'type' in e && 'timestamp' in e && 'actor' in e && 'actorRole' in e);
  });
}

function isValidPurchaseOrders(value: unknown): value is PurchaseOrder[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((raw) => {
    if (typeof raw !== 'object' || raw === null) return false;
    const po = raw as Partial<PurchaseOrder>;
    return typeof po.clientRut === 'string' && typeof po.totalAmountUF === 'number' && typeof po.status === 'string';
  });
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value)) return false;
  return value.every((raw) => {
    if (typeof raw !== 'object' || raw === null) return false;
    const m = raw as Partial<ChatMessage>;
    return typeof m.id === 'string' && typeof m.text === 'string' && typeof m.timestamp === 'string' && VALID_ROLES.has(m.senderRole as string);
  });
}

export interface NewOrderInput {
  purchaseOrderId: string;
  clientName: string;
  projectName: string;
  productSpecs: ProductSpecs;
  promisedDate: string;
  priority: Priority;
}

export interface ClientProfile {
  clientName: string;
  clientRut: string;
  purchaseOrders: PurchaseOrder[];
  orders: WorkOrder[];
  activeCount: number;
  completedCount: number;
  totalAmountUF: number;
}

export interface NewChatMessageInput {
  senderRole: UserRole;
  senderName: string;
  text: string;
  orderId?: string;
}

interface OrderContextValue {
  orders: WorkOrder[];
  purchaseOrders: PurchaseOrder[];
  /** OTs en o después de Despacho: en tránsito (estación Despacho) o ya entregadas (COMPLETADO). */
  shipments: WorkOrder[];
  messages: ChatMessage[];
  updateOrder: (id: string, patch: Partial<WorkOrder>) => void;
  getOrderById: (id: string) => WorkOrder | undefined;
  advanceStation: (id: string, actor: string, actorRole: UserRole, note?: string) => void;
  addNote: (id: string, actor: string, actorRole: UserRole, note: string) => void;
  reassignOperator: (id: string, operator: string, actor: string, actorRole: UserRole) => void;
  createOrder: (input: NewOrderInput, actor: string, actorRole: UserRole) => WorkOrder;
  getClientProfile: (clientName: string) => ClientProfile;
  sendMessage: (input: NewChatMessageInput) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

function withEvent(order: WorkOrder, event: Omit<TraceabilityEvent, 'id'>): WorkOrder {
  const id = `${order.id}-ev-${order.history.length + 1}-${Date.now()}`;
  return { ...order, history: [...order.history, { ...event, id }], lastMovementAt: event.timestamp };
}

/**
 * Cierra la OC cuando todas sus OT quedaron COMPLETADO: mantiene la OC en sincronía
 * con el taller sin que nadie tenga que actualizarla a mano.
 */
function syncPurchaseOrderStatus(pos: PurchaseOrder[], orders: WorkOrder[], purchaseOrderId: string): PurchaseOrder[] {
  const siblings = orders.filter((o) => o.purchaseOrderId === purchaseOrderId);
  if (siblings.length === 0) return pos;
  const allDone = siblings.every((o) => o.status === 'COMPLETADO');
  return pos.map((po) => {
    if (po.id !== purchaseOrderId) return po;
    if (allDone && po.status !== 'COMPLETADA') return { ...po, status: 'COMPLETADA' };
    if (!allDone && po.status === 'COMPLETADA') return { ...po, status: 'EN_PRODUCCION' };
    return po;
  });
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>(() => {
    const stored = storageService.get<WorkOrder[] | null>(ORDERS_KEY, null);
    return isValidOrders(stored) ? stored : mockDataService.getInitialOrders();
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const stored = storageService.get<PurchaseOrder[] | null>(PURCHASE_ORDERS_KEY, null);
    return isValidPurchaseOrders(stored) ? stored : mockDataService.getInitialPurchaseOrders();
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = storageService.get<ChatMessage[] | null>(MESSAGES_KEY, null);
    return isValidMessages(stored) ? stored : mockDataService.getInitialMessages();
  });

  // Sincronización reactiva entre pestañas/ventanas: si otra pestaña (ej. un OPERATOR
  // en el taller) avanza una OT o escribe en el canal, esta pestaña (ej. el ADMIN o un
  // CLIENT) se entera al instante sin recargar — el evento `storage` solo llega a
  // pestañas distintas de la que escribió, así que no compite con las actualizaciones locales.
  useEffect(() => {
    const unsubOrders = storageService.subscribe<WorkOrder[]>(ORDERS_KEY, (value) => {
      if (isValidOrders(value)) setOrders(value);
    });
    const unsubPos = storageService.subscribe<PurchaseOrder[]>(PURCHASE_ORDERS_KEY, (value) => {
      if (isValidPurchaseOrders(value)) setPurchaseOrders(value);
    });
    const unsubMessages = storageService.subscribe<ChatMessage[]>(MESSAGES_KEY, (value) => {
      if (isValidMessages(value)) setMessages(value);
    });
    return () => {
      unsubOrders();
      unsubPos();
      unsubMessages();
    };
  }, []);

  const persistOrders = (next: WorkOrder[]) => {
    storageService.set(ORDERS_KEY, next);
    return next;
  };

  const persistPurchaseOrders = (next: PurchaseOrder[]) => {
    storageService.set(PURCHASE_ORDERS_KEY, next);
    return next;
  };

  const persistMessages = (next: ChatMessage[]) => {
    storageService.set(MESSAGES_KEY, next);
    return next;
  };

  const updateOrder = (id: string, patch: Partial<WorkOrder>) => {
    setOrders((prev) => persistOrders(prev.map((order) => (order.id === id ? { ...order, ...patch } : order))));
  };

  const getOrderById = (id: string) => orders.find((order) => order.id === id);

  /** Avanza la OT a la siguiente estación del pipeline, o la marca COMPLETADO si sale de Despacho. */
  const advanceStation = (id: string, actor: string, actorRole: UserRole, note?: string) => {
    setOrders((prev) => {
      const next = persistOrders(prev.map((order) => {
        if (order.id !== id) return order;
        const now = new Date().toISOString();
        const currentIndex = STATIONS.indexOf(order.currentStation);
        let updated = withEvent(order, { type: 'STATION_EXIT', station: order.currentStation, timestamp: now, actor, actorRole, note });

        if (currentIndex >= STATIONS.length - 1) {
          return { ...updated, status: 'COMPLETADO', progressPercentage: 100 };
        }

        const nextStation: Station = STATIONS[currentIndex + 1];
        updated = withEvent(updated, { type: 'STATION_ENTER', station: nextStation, timestamp: now, actor, actorRole });
        const progressPercentage = Math.min(Math.round(((currentIndex + 1) / STATIONS.length) * 100 + 5), 99);
        return {
          ...updated,
          currentStation: nextStation,
          status: updated.status === 'DETENIDO' ? 'EN_RIESGO' : updated.status,
          progressPercentage,
        };
      }));

      const changed = next.find((o) => o.id === id);
      if (changed) {
        setPurchaseOrders((prevPos) => persistPurchaseOrders(syncPurchaseOrderStatus(prevPos, next, changed.purchaseOrderId)));
      }
      return next;
    });
  };

  /** Agrega una nota SOLO al historial de la OT `id` — nunca toca ninguna otra orden. */
  const addNote = (id: string, actor: string, actorRole: UserRole, note: string) => {
    setOrders((prev) => persistOrders(prev.map((order) => {
      if (order.id !== id) return order;
      return withEvent(order, { type: 'NOTE', station: order.currentStation, timestamp: new Date().toISOString(), actor, actorRole, note });
    })));
  };

  const reassignOperator = (id: string, operator: string, actor: string, actorRole: UserRole) => {
    setOrders((prev) => persistOrders(prev.map((order) => {
      if (order.id !== id) return order;
      const withEv = withEvent(order, {
        type: 'REASSIGNMENT',
        station: order.currentStation,
        timestamp: new Date().toISOString(),
        actor,
        actorRole,
        note: `Reasignado a ${operator}`,
      });
      return { ...withEv, assignedOperator: operator };
    })));
  };

  const createOrder = (input: NewOrderInput, actor: string, actorRole: UserRole): WorkOrder => {
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
      history: [{ id: `${sequence}-ev-1`, type: 'STATION_ENTER', station: 'ORDEN_COMPRA', timestamp: now, actor, actorRole }],
    };
    setOrders((prev) => persistOrders([newOrder, ...prev]));
    setPurchaseOrders((prev) => persistPurchaseOrders(prev.map((po) =>
      po.id === input.purchaseOrderId && po.status === 'RECIBIDA' ? { ...po, status: 'EN_PRODUCCION' } : po,
    )));
    return newOrder;
  };

  const getClientProfile = (clientName: string): ClientProfile => {
    const clientPos = purchaseOrders.filter((po) => po.clientName === clientName);
    const clientOrders = orders.filter((o) => o.clientName === clientName);
    return {
      clientName,
      clientRut: clientPos[0]?.clientRut ?? '',
      purchaseOrders: clientPos,
      orders: clientOrders,
      activeCount: clientOrders.filter((o) => o.status !== 'COMPLETADO').length,
      completedCount: clientOrders.filter((o) => o.status === 'COMPLETADO').length,
      totalAmountUF: clientPos.reduce((sum, po) => sum + po.totalAmountUF, 0),
    };
  };

  const sendMessage = (input: NewChatMessageInput) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      senderRole: input.senderRole,
      senderName: input.senderName,
      text: input.text.trim(),
      timestamp: new Date().toISOString(),
      orderId: input.orderId,
    };
    setMessages((prev) => persistMessages([...prev, newMessage]));
  };

  const shipments = useMemo(
    () => orders.filter((o) => o.currentStation === 'DESPACHO' || o.status === 'COMPLETADO'),
    [orders],
  );

  const value = useMemo<OrderContextValue>(
    () => ({
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
    }),
    [orders, purchaseOrders, shipments, messages],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrderContext(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrderContext debe usarse dentro de un OrderProvider');
  return ctx;
}
