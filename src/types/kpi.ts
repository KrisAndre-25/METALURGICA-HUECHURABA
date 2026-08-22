import type { OrderStatus, Station } from './order';

/** Resumen agregado de estado de todas las OT activas, para tarjetas del dashboard. */
export interface StatusSummary {
  status: OrderStatus;
  count: number;
}

/** Carga de trabajo (cantidad de OT) por estación, para el gráfico de cuellos de botella. */
export interface StationLoad {
  station: Station;
  orderCount: number;
  averageHoursInStation: number;
}

/** Puntaje de salud operacional 0-100 de una OT individual, con el factor que más pesó. */
export interface HealthScore {
  orderId: string;
  score: number;
  status: OrderStatus;
  daysToPromised: number;
  mainRiskFactor: string | null;
}

/** KPIs globales de planta para el header del dashboard. */
export interface PlantKpis {
  totalActiveOrders: number;
  onTimePercentage: number;
  averageCycleTimeDays: number;
  stoppedOrders: number;
}
