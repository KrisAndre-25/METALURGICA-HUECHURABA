import { useMemo } from 'react';
import type { WorkOrder } from '../types/order';
import type { DiagnosticInsight } from '../types/kpi';
import { calculateStationLoad } from '../utils/kpiCalculators';
import { formatStation } from '../utils/formatters';

/**
 * Motor de diagnóstico basado en reglas: analiza las OTs activas y genera
 * recomendaciones en lenguaje natural, priorizadas por severidad.
 */
export function useDiagnosticEngine(orders: WorkOrder[]): DiagnosticInsight[] {
  return useMemo(() => {
    const active = orders.filter((o) => o.status !== 'COMPLETADO');
    const insights: DiagnosticInsight[] = [];

    const stopped = active.filter((o) => o.status === 'DETENIDO');
    if (stopped.length > 0) {
      insights.push({
        id: 'diag-stopped',
        severity: 'critical',
        title: `${stopped.length} ${stopped.length === 1 ? 'OT detenida requiere' : 'OTs detenidas requieren'} atención inmediata`,
        message: `${stopped.map((o) => o.projectName).slice(0, 3).join(', ')}${stopped.length > 3 ? ' y otras' : ''} ${stopped.length === 1 ? 'está bloqueada' : 'están bloqueadas'} por un impedimento operativo. Revisa la nota de la última estación antes de reasignar personal.`,
        relatedOrderIds: stopped.map((o) => o.id),
      });
    }

    const late = active.filter((o) => o.status === 'ATRASADO');
    if (late.length > 0) {
      insights.push({
        id: 'diag-late',
        severity: 'critical',
        title: `${late.length} ${late.length === 1 ? 'OT con fecha comprometida vencida' : 'OTs con fecha comprometida vencida'}`,
        message: `Contacta al cliente para renegociar plazo o prioriza recursos en ${late[0].projectName}${late.length > 1 ? ` y ${late.length - 1} más` : ''}.`,
        relatedOrderIds: late.map((o) => o.id),
      });
    }

    const stationLoad = calculateStationLoad(orders);
    const bottleneck = [...stationLoad].sort((a, b) => b.orderCount - a.orderCount)[0];
    if (bottleneck && bottleneck.orderCount >= 3) {
      insights.push({
        id: 'diag-bottleneck',
        severity: 'warning',
        title: `Cuello de botella en ${formatStation(bottleneck.station)}`,
        message: `Hay ${bottleneck.orderCount} OTs acumuladas en esta estación, con un lead time promedio de ${Math.round(bottleneck.averageLeadTimeHours)} h. Evalúa reforzar personal ahí.`,
        relatedOrderIds: active.filter((o) => o.currentStation === bottleneck.station).map((o) => o.id),
      });
    }

    const atRisk = active.filter((o) => o.status === 'EN_RIESGO');
    if (atRisk.length > 0 && stopped.length === 0 && late.length === 0) {
      insights.push({
        id: 'diag-at-risk',
        severity: 'warning',
        title: `${atRisk.length} ${atRisk.length === 1 ? 'OT con margen ajustado' : 'OTs con margen ajustado'} a la fecha comprometida`,
        message: `Sin holgura para nuevos imprevistos en ${atRisk[0].projectName}${atRisk.length > 1 ? ` y ${atRisk.length - 1} más` : ''}. Haz seguimiento diario.`,
        relatedOrderIds: atRisk.map((o) => o.id),
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'diag-all-good',
        severity: 'info',
        title: 'Planta operando sin alertas críticas',
        message: 'Todas las OTs activas están en tiempo o con margen saludable. Buen ritmo de producción.',
        relatedOrderIds: [],
      });
    }

    const order = { critical: 0, warning: 1, info: 2 };
    return insights.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [orders]);
}
