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

export type OrderStatus = 'EN_TIEMPO' | 'EN_RIESGO' | 'ATRASADO' | 'DETENIDO';

export type Priority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type PurchaseOrderStatus = 'PENDIENTE' | 'APROBADA' | 'FACTURADA' | 'ANULADA';

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

/** Registro de paso de una OT por una estación, con tiempos reales vs. estimados. */
export interface StationHistoryEntry {
  station: Station;
  enteredAt: string;
  exitedAt: string | null;
  estimatedHours: number;
  actualHours: number | null;
  responsible: string;
  notes?: string;
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
  history: StationHistoryEntry[];
}
