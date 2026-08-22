/** Las 7 estaciones del flujo de producción, en orden secuencial fijo. */
export const STATIONS = [
  'ORDEN_COMPRA',
  'COMPRA_INSUMOS',
  'CORTE',
  'ARMADO_SOLDADURA',
  'PINTURA',
  'CONTROL_CALIDAD',
  'DESPACHO',
] as const;

export type Station = (typeof STATIONS)[number];

export type OrderStatus = 'EN_TIEMPO' | 'EN_RIESGO' | 'ATRASADO' | 'DETENIDO' | 'COMPLETADO';

export type Priority = 'BAJA' | 'NORMAL' | 'ALTA' | 'URGENTE';

/** Estado comercial de la OC: dónde está en su ciclo de vida de negocio (no de taller). */
export type PurchaseOrderStatus = 'RECIBIDA' | 'EN_PRODUCCION' | 'COMPLETADA';

/** Orden de Compra (OC): el documento comercial que origina una o más OT. */
export interface PurchaseOrder {
  id: string;
  clientName: string;
  clientRut: string;
  issuedDate: string;
  totalAmountUF: number;
  status: PurchaseOrderStatus;
}

/** Especificaciones técnicas del producto a fabricar dentro de una OT. */
export interface ProductSpecs {
  structureType: string;
  dimensions: string;
  weightTons: number;
  paintSpecification: string;
}

export type TraceabilityEventType = 'STATION_ENTER' | 'STATION_EXIT' | 'NOTE' | 'PRIORITY_CHANGE' | 'REASSIGNMENT' | 'HOLD' | 'RESUME';

/** Evento de trazabilidad: cualquier hito relevante ocurrido sobre una OT, con quién y cuándo. */
export interface TraceabilityEvent {
  id: string;
  type: TraceabilityEventType;
  station: Station;
  timestamp: string;
  actor: string;
  /** Rol de quien generó el evento, para mostrarlo junto al nombre en el historial. */
  actorRole: import('./user').UserRole;
  note?: string;
}

/** Orden de Fabricación / Trabajo (OT): la unidad operativa que se sigue por planta. */
export interface WorkOrder {
  id: string;
  purchaseOrderId: string;
  clientName: string;
  projectName: string;
  productSpecs: ProductSpecs;
  orderDate: string;
  promisedDate: string;
  priority: Priority;
  currentStation: Station;
  status: OrderStatus;
  progressPercentage: number;
  assignedOperator: string;
  lastMovementAt: string;
  history: TraceabilityEvent[];
}
