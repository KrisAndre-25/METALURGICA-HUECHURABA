import { useMemo } from 'react';
import type { WorkOrder } from '../types/order';
import type { HealthScore } from '../types/kpi';
import { calculateHealthScore } from '../utils/kpiCalculators';

/** Puntaje de salud de una única OT, recalculado solo cuando la orden cambia. */
export function useHealthScore(order: WorkOrder): HealthScore {
  return useMemo(() => calculateHealthScore(order), [order]);
}

/** Puntaje de salud para un conjunto de OTs, ordenado de más a menos crítico. */
export function useHealthScores(orders: WorkOrder[]): HealthScore[] {
  return useMemo(
    () => orders.map(calculateHealthScore).sort((a, b) => a.score - b.score),
    [orders],
  );
}
