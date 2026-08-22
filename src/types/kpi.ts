import type { OrderStatus, Station } from './order';

/** Resumen agregado de estado de todas las OT activas, para tarjetas del dashboard. */
export interface StatusSummary {
  status: OrderStatus;
  count: number;
}

/** Carga de trabajo (cantidad de OT) por estación, para el pipeline horizontal. */
export interface StationLoad {
  station: Station;
  orderCount: number;
  averageLeadTimeHours: number;
}

/** Puntaje de salud operacional 0-100 de una OT individual, con el factor que más pesó. */
export interface HealthScore {
  orderId: string;
  score: number;
  status: OrderStatus;
  daysToPromised: number;
  mainRiskFactor: string | null;
}

/** KPIs globales de planta: financieros (solo ADMIN) y operacionales. */
export interface PlantKpis {
  totalActiveOrders: number;
  onTimeDeliveryPercentage: number;
  averageCycleTimeDays: number;
  stoppedOrders: number;
  activeAmountUF: number;
  plantHealthScore: number;
}

export type DiagnosticSeverity = 'info' | 'warning' | 'critical';

/** Una recomendación en lenguaje natural generada por el motor de diagnóstico. */
export interface DiagnosticInsight {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  relatedOrderIds: string[];
}
