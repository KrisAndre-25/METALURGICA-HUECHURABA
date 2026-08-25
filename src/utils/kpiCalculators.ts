import { STATIONS, type DelayReason, type PurchaseOrder, type Station, type WorkOrder } from '../types/order';
import type { HealthScore, PlantKpis, StationLoad, StatusSummary } from '../types/kpi';
import type { Language } from '../types/language';
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

/** Carga de OTs activas por estación y su lead time promedio real, para el pipeline horizontal. */
export function calculateStationLoad(orders: WorkOrder[]): StationLoad[] {
  return STATIONS.map((station) => {
    const inStation = orders.filter((o) => o.currentStation === station && o.status !== 'COMPLETADO');

    const leadTimes = orders.flatMap((order) => {
      const enter = order.history.find((e) => e.station === station && e.type === 'STATION_ENTER');
      const exit = order.history.find((e) => e.station === station && e.type === 'STATION_EXIT');
      if (!enter || !exit) return [];
      const hours = (new Date(exit.timestamp).getTime() - new Date(enter.timestamp).getTime()) / (60 * 60 * 1000);
      return hours > 0 ? [hours] : [];
    });

    const averageLeadTimeHours = leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0;
    return { station, orderCount: inStation.length, averageLeadTimeHours };
  });
}

const STATUS_BASE_SCORE: Record<WorkOrder['status'], number> = {
  EN_TIEMPO: 90,
  EN_RIESGO: 65,
  ATRASADO: 35,
  DETENIDO: 15,
  COMPLETADO: 100,
};

const RISK_FACTOR_LABELS: Record<Language, { stopped: string; overdue: string; slow: string; tight: string }> = {
  es: {
    stopped: 'Estación detenida',
    overdue: 'Fecha comprometida vencida',
    slow: 'Ritmo de avance insuficiente',
    tight: 'Margen ajustado a la fecha comprometida',
  },
  en: {
    stopped: 'Station stopped',
    overdue: 'Past promised date',
    slow: 'Insufficient progress pace',
    tight: 'Tight margin to promised date',
  },
};

/** Puntaje 0-100 de una OT: base por estado, ajustado por cercanía a la fecha comprometida. */
export function calculateHealthScore(order: WorkOrder, language: Language = 'es'): HealthScore {
  const daysToPromised = daysBetween(new Date().toISOString(), order.promisedDate);
  const base = STATUS_BASE_SCORE[order.status];
  const deadlinePenalty = order.status !== 'COMPLETADO' && daysToPromised < 0 ? Math.min(Math.abs(daysToPromised) * 2, 30) : 0;
  const score = Math.max(0, Math.min(100, base - deadlinePenalty));
  const labels = RISK_FACTOR_LABELS[language];

  let mainRiskFactor: string | null = null;
  if (order.status === 'DETENIDO') mainRiskFactor = labels.stopped;
  else if (order.status !== 'COMPLETADO' && daysToPromised < 0) mainRiskFactor = labels.overdue;
  else if (order.status === 'ATRASADO') mainRiskFactor = labels.slow;
  else if (order.status === 'EN_RIESGO') mainRiskFactor = labels.tight;

  return { orderId: order.id, score, status: order.status, daysToPromised, mainRiskFactor };
}

/** KPIs globales de planta: OTD, ciclo promedio, monto activo en UF y salud general. */
export function calculatePlantKpis(orders: WorkOrder[], purchaseOrders: PurchaseOrder[]): PlantKpis {
  const active = orders.filter((o) => o.status !== 'COMPLETADO');
  const totalActiveOrders = active.length;

  const onTime = active.filter((o) => o.status === 'EN_TIEMPO' || o.status === 'EN_RIESGO').length;
  const onTimeDeliveryPercentage = totalActiveOrders > 0 ? Math.round((onTime / totalActiveOrders) * 100) : 100;

  const cycleTimes = active.map((o) => daysBetween(o.orderDate, new Date().toISOString()));
  const averageCycleTimeDays = cycleTimes.length > 0
    ? Math.round((cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length) * 10) / 10
    : 0;

  const stoppedOrders = active.filter((o) => o.status === 'DETENIDO').length;

  const activeOcIds = new Set(active.map((o) => o.purchaseOrderId));
  const activeAmountUF = purchaseOrders
    .filter((oc) => activeOcIds.has(oc.id))
    .reduce((sum, oc) => sum + oc.totalAmountUF, 0);

  const scores = active.map((o) => calculateHealthScore(o).score);
  const plantHealthScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;

  return { totalActiveOrders, onTimeDeliveryPercentage, averageCycleTimeDays, stoppedOrders, activeAmountUF, plantHealthScore };
}

export function stationLabelFor(station: Station): string {
  return STATION_META[station].label;
}

export interface DelayReasonSummary {
  reason: DelayReason;
  count: number;
}

/** Cuenta las paradas registradas (eventos HOLD con motivo) por causa raíz, para el reporte de cuellos de botella. */
export function summarizeDelayReasons(orders: WorkOrder[]): DelayReasonSummary[] {
  const counts = new Map<DelayReason, number>();
  for (const order of orders) {
    for (const event of order.history) {
      if (event.type === 'HOLD' && event.delayReason) {
        counts.set(event.delayReason, (counts.get(event.delayReason) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries()).map(([reason, count]) => ({ reason, count }));
}
