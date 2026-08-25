import { useMemo } from 'react';
import type { WorkOrder } from '../types/order';
import type { HealthScore } from '../types/kpi';
import type { Language } from '../types/language';
import { calculateHealthScore } from '../utils/kpiCalculators';

/** Puntaje de salud de una única OT, recalculado solo cuando la orden cambia. */
export function useHealthScore(order: WorkOrder, language: Language = 'es'): HealthScore {
  return useMemo(() => calculateHealthScore(order, language), [order, language]);
}

/** Puntaje de salud para un conjunto de OTs, ordenado de más a menos crítico. */
export function useHealthScores(orders: WorkOrder[], language: Language = 'es'): HealthScore[] {
  return useMemo(
    () => orders.map((order) => calculateHealthScore(order, language)).sort((a, b) => a.score - b.score),
    [orders, language],
  );
}
