import { STATIONS, type Station, type WorkOrder } from '../types/order';
import type { HealthScore, PlantKpis, StationLoad, StatusSummary } from '../types/kpi';
import { STATION_META } from '../data/mockStations';
import { daysBetween } from './formatters';

/** Cuenta OTs por estado, para las tarjetas de resumen del dashboard. */
export function summarizeByStatus(orders: WorkOrder[]): StatusSummary[] {
  const counts = new Map<WorkOrder['status'], number>();
  for (const order of orders) {
    counts.set(order.status, (counts.get(order.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

/** Carga de OTs activas por estación y promedio de horas ahí, para detectar cuellos de botella. */
export function calculateStationLoad(orders: WorkOrder[]): StationLoad[] {
  return STATIONS.map((station) => {
    const inStation = orders.filter((o) => o.currentStation === station);
    const hours = inStation
      .map((o) => o.history.find((h) => h.station === station)?.actualHours)
      .filter((h): h is number => h !== null && h !== undefined);
    const averageHoursInStation = hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
    return { station, orderCount: inStation.length, averageHoursInStation };
  });
}

const STATUS_BASE_SCORE: Record<WorkOrder['status'], number> = {
  EN_TIEMPO: 90,
  EN_RIESGO: 65,
  ATRASADO: 35,
  DETENIDO: 15,
};

/** Puntaje 0-100 de una OT: base por estado, ajustado por cercanía a la fecha comprometida. */
export function calculateHealthScore(order: WorkOrder): HealthScore {
  const daysToPromised = daysBetween(new Date().toISOString(), order.promisedDate);
  const base = STATUS_BASE_SCORE[order.status];
  const deadlinePenalty = daysToPromised < 0 ? Math.min(Math.abs(daysToPromised) * 2, 30) : 0;
  const score = Math.max(0, Math.min(100, base - deadlinePenalty));

  let mainRiskFactor: string | null = null;
  if (order.status === 'DETENIDO') mainRiskFactor = 'Estación detenida';
  else if (daysToPromised < 0) mainRiskFactor = 'Fecha comprometida vencida';
  else if (order.status === 'ATRASADO') mainRiskFactor = 'Ritmo de avance insuficiente';
  else if (order.status === 'EN_RIESGO') mainRiskFactor = 'Margen ajustado a la fecha comprometida';

  return { orderId: order.id, score, status: order.status, daysToPromised, mainRiskFactor };
}

/** KPIs globales de planta para el header del dashboard. */
export function calculatePlantKpis(orders: WorkOrder[]): PlantKpis {
  const totalActiveOrders = orders.length;
  const onTime = orders.filter((o) => o.status === 'EN_TIEMPO').length;
  const onTimePercentage = totalActiveOrders > 0 ? Math.round((onTime / totalActiveOrders) * 100) : 0;

  const cycleTimes = orders
    .filter((o) => o.history.length > 0)
    .map((o) => daysBetween(o.orderDate, new Date().toISOString()));
  const averageCycleTimeDays = cycleTimes.length > 0
    ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
    : 0;

  const stoppedOrders = orders.filter((o) => o.status === 'DETENIDO').length;

  return { totalActiveOrders, onTimePercentage, averageCycleTimeDays, stoppedOrders };
}

export function stationLabelFor(station: Station): string {
  return STATION_META[station].label;
}
