import { useMemo } from 'react';
import type { WorkOrder } from '../types/order';
import type { DiagnosticInsight } from '../types/kpi';
import type { Language } from '../types/language';
import { calculateStationLoad } from '../utils/kpiCalculators';
import { formatStation } from '../utils/formatters';
import { STRINGS } from '../i18n/strings';

/**
 * Motor de diagnóstico basado en reglas: analiza las OTs activas y genera
 * recomendaciones en lenguaje natural, priorizadas por severidad.
 */
export function useDiagnosticEngine(orders: WorkOrder[], language: Language = 'es'): DiagnosticInsight[] {
  return useMemo(() => {
    const t = STRINGS[language].diagnostics;
    const active = orders.filter((o) => o.status !== 'COMPLETADO');
    const insights: DiagnosticInsight[] = [];

    const stopped = active.filter((o) => o.status === 'DETENIDO');
    if (stopped.length > 0) {
      const names = stopped.map((o) => o.projectName).slice(0, 3).join(', ');
      insights.push({
        id: 'diag-stopped',
        severity: 'critical',
        title: t.stoppedTitle(stopped.length),
        message: t.stoppedMessage(names, stopped.length > 3, stopped.length > 1),
        relatedOrderIds: stopped.map((o) => o.id),
      });
    }

    const late = active.filter((o) => o.status === 'ATRASADO');
    if (late.length > 0) {
      insights.push({
        id: 'diag-late',
        severity: 'critical',
        title: t.lateTitle(late.length),
        message: t.lateMessage(late[0].projectName, late.length - 1),
        relatedOrderIds: late.map((o) => o.id),
      });
    }

    const stationLoad = calculateStationLoad(orders);
    const bottleneck = [...stationLoad].sort((a, b) => b.orderCount - a.orderCount)[0];
    if (bottleneck && bottleneck.orderCount >= 3) {
      insights.push({
        id: 'diag-bottleneck',
        severity: 'warning',
        title: t.bottleneckTitle(formatStation(bottleneck.station, language)),
        message: t.bottleneckMessage(bottleneck.orderCount, Math.round(bottleneck.averageLeadTimeHours)),
        relatedOrderIds: active.filter((o) => o.currentStation === bottleneck.station).map((o) => o.id),
      });
    }

    const atRisk = active.filter((o) => o.status === 'EN_RIESGO');
    if (atRisk.length > 0 && stopped.length === 0 && late.length === 0) {
      insights.push({
        id: 'diag-at-risk',
        severity: 'warning',
        title: t.atRiskTitle(atRisk.length),
        message: t.atRiskMessage(atRisk[0].projectName, atRisk.length - 1),
        relatedOrderIds: atRisk.map((o) => o.id),
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: 'diag-all-good',
        severity: 'info',
        title: t.allGoodTitle,
        message: t.allGoodMessage,
        relatedOrderIds: [],
      });
    }

    const order = { critical: 0, warning: 1, info: 2 };
    return insights.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [orders, language]);
}
