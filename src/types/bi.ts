import type { DelayReason, Station } from './order';

/**
 * Capacidad instalada de una estación — espejo de la tabla `capacidad_estaciones`
 * (ver supabase/migrations). Editable por Administración.
 */
export interface StationCapacity {
  station: Station;
  weeklyHours: number;
  operators: number;
}

/**
 * Estudio de tiempos de UNA estación dentro de una ventana de fechas. Todas las
 * horas están en "horas de turno" (ya escaladas por `weeklyHours / 168`), así que
 * `workedHours + stoppedHours + idleHours === availableHours` siempre cuadra.
 */
export interface StationTimeStudy {
  station: Station;
  operators: number;
  availableHours: number;
  workedHours: number;
  stoppedHours: number;
  idleHours: number;
  /** workedHours / availableHours, 0-100. */
  utilizationPct: number;
  /** Paradas (eventos HOLD) vigentes en algún momento de la ventana, en esta estación. */
  stopCount: number;
}

export interface StopCauseSummary {
  /** `null` = parada sin causa estructurada (registrada antes del catálogo de motivos). */
  reason: DelayReason | null;
  count: number;
  hours: number;
}

/** Snapshot consolidado de una ventana — es lo que se guarda en `kpis_snapshot` (JSONB). */
export interface BiKpiSnapshot {
  from: string;
  to: string;
  /** Disponibilidad × Rendimiento × Calidad, 0-100. */
  oeePct: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  totalAvailableHours: number;
  totalWorkedHours: number;
  totalStoppedHours: number;
  totalIdleHours: number;
  /** Utilización promedio del personal (ponderada por dotación), 0-100. */
  staffUtilizationPct: number;
  stations: StationTimeStudy[];
  stopCauses: StopCauseSummary[];
}

export const BI_REPORT_TYPES = ['DIARIO', 'SEMANAL', 'MENSUAL', 'A_PEDIDO', 'CIERRE_MES'] as const;
export type BiReportType = (typeof BI_REPORT_TYPES)[number];

/** Informe estructurado de IA, con las 4 secciones pedidas por Administración. */
export interface BiAiAnalysis {
  executiveSummary: string;
  bottlenecksAndIdle: string[];
  staffReorganization: string[];
  rootCauseAnalysis: string[];
  /** `gemini`/`claude` = generado por IA vía la función serverless; `local` = motor de reglas de respaldo. */
  source: 'gemini' | 'claude' | 'local';
}

/**
 * Reporte archivado — espejo de la tabla `reportes_historicos_bi`. `summaryText`
 * y `staffingText` son las columnas de texto plano (`resumen_ia`,
 * `recomendaciones_dotacion`); `analysis` guarda la versión estructurada para
 * volver a renderizar el detalle sin parsear texto.
 */
export interface BiReport {
  id: string;
  type: BiReportType;
  from: string;
  to: string;
  kpis: BiKpiSnapshot;
  summaryText: string;
  staffingText: string;
  analysis: BiAiAnalysis;
  /** ID del usuario que lo guardó, o `null` si lo generó el cierre automático de mes. */
  createdBy: string | null;
  createdByName: string;
  timestamp: string;
}
