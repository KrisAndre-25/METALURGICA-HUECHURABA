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
  /** Vendedor que originó la venta (nombre) — es el contacto comercial mostrado al cliente. */
  assignedVendedor?: string;
}

export type SalesRequestStatus = 'PENDIENTE' | 'CARGADA' | 'RECHAZADA';

/**
 * Solicitud de Venta: el Vendedor la crea al recibir la venta del cliente y le
 * asigna Prioridad. Administración la revisa y, si corresponde, la "carga" —
 * eso crea la OC y genera automáticamente la OT (ver `loadPurchaseOrder`).
 */
export interface SalesRequest {
  id: string;
  clientName: string;
  clientRut: string;
  projectName: string;
  description: string;
  estimatedAmountUF: number;
  priority: Priority;
  requestedBy: string;
  requestedAt: string;
  status: SalesRequestStatus;
  purchaseOrderId?: string;
  reviewNote?: string;
}

/** Los 5 motivos predefinidos para detener una OT — sustituye la nota libre por un registro estructurado. */
export const DELAY_REASONS = [
  'AVERIA_MAQUINARIA',
  'FALTA_INSUMOS',
  'FALTA_PERSONAL',
  'CORTE_LUZ',
  'ESPERA_INSPECCION',
] as const;

export type DelayReason = (typeof DELAY_REASONS)[number];

export type CorrectiveAction = 'BALANCEAR_LINEA' | 'HORAS_EXTRA';

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
  /** Solo en eventos `HOLD`: motivo estructurado de la parada (análisis de causa raíz). */
  delayReason?: DelayReason;
  /** Solo en eventos `RESUME`: acción correctiva aplicada al reanudar. */
  correctiveAction?: CorrectiveAction;
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
