import type { BiAiAnalysis, BiKpiSnapshot } from '../types/bi';
import type { Language } from '../types/language';
import type { Strings } from '../i18n/strings';
import { formatDate, formatDelayReason, formatShiftHours, formatStation } from '../utils/formatters';

const AI_ENDPOINT = '/.netlify/functions/bi-analysis';
// El plan gratuito de Gemini puede tardar 15-45 s en horas de alta demanda.
const AI_TIMEOUT_MS = 90_000;

/** Umbrales del motor local: sobre 85% de utilización es cuello de botella; bajo 50%, estación ociosa. */
const BOTTLENECK_UTIL = 85;
const IDLE_UTIL = 50;

/**
 * Métricas en formato legible para el modelo: nombres de estación y causa ya
 * traducidos, así la IA los cita tal cual en el informe.
 */
function toAiMetrics(snapshot: BiKpiSnapshot, language: Language, t: Strings) {
  return {
    period: { from: formatDate(snapshot.from, language), to: formatDate(snapshot.to, language) },
    plant: {
      oeePct: snapshot.oeePct,
      availabilityPct: snapshot.availabilityPct,
      performancePct: snapshot.performancePct,
      qualityPct: snapshot.qualityPct,
      staffUtilizationPct: snapshot.staffUtilizationPct,
      availableHours: snapshot.totalAvailableHours,
      workedHours: snapshot.totalWorkedHours,
      stoppedHours: snapshot.totalStoppedHours,
      idleHours: snapshot.totalIdleHours,
    },
    stations: snapshot.stations.map((s) => ({
      station: formatStation(s.station, language),
      operators: s.operators,
      availableHours: s.availableHours,
      workedHours: s.workedHours,
      stoppedHours: s.stoppedHours,
      idleHours: s.idleHours,
      utilizationPct: s.utilizationPct,
      stops: s.stopCount,
    })),
    stopCauses: snapshot.stopCauses.map((c) => ({
      cause: c.reason ? formatDelayReason(c.reason, language) : t.bi.unclassifiedCause,
      stops: c.count,
      hoursLost: c.hours,
    })),
  };
}

function isAnalysisPayload(value: unknown): value is Omit<BiAiAnalysis, 'source'> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  const isStringArray = (x: unknown) => Array.isArray(x) && x.every((i) => typeof i === 'string');
  return (
    typeof v.executiveSummary === 'string' &&
    isStringArray(v.bottlenecksAndIdle) &&
    isStringArray(v.staffReorganization) &&
    isStringArray(v.rootCauseAnalysis)
  );
}

/**
 * Motor de reglas de respaldo: produce las mismas 4 secciones que la IA a partir
 * de umbrales fijos, para que el módulo funcione sin conexión, en `npm run dev`
 * (sin funciones de Netlify) o si la API no responde.
 */
export function buildLocalAnalysis(snapshot: BiKpiSnapshot, language: Language, t: Strings): BiAiAnalysis {
  const L = t.bi.local;
  const h = (n: number) => formatShiftHours(n, language);
  const station = (s: BiKpiSnapshot['stations'][number]) => formatStation(s.station, language);

  const level = snapshot.oeePct >= 85 ? L.levelHigh : snapshot.oeePct >= 60 ? L.levelMid : L.levelLow;
  const executiveSummary = L.summary(
    formatDate(snapshot.from, language),
    formatDate(snapshot.to, language),
    snapshot.oeePct,
    snapshot.availabilityPct,
    snapshot.performancePct,
    snapshot.staffUtilizationPct,
    h(snapshot.totalIdleHours),
    h(snapshot.totalStoppedHours),
    level,
  );

  const withCapacity = snapshot.stations.filter((s) => s.availableHours > 0);
  const byLoad = [...withCapacity].sort((a, b) => b.utilizationPct + b.stoppedHours / 10 - (a.utilizationPct + a.stoppedHours / 10));
  const bottlenecks = byLoad.filter((s) => s.utilizationPct >= BOTTLENECK_UTIL || (s.stoppedHours > 0 && s.stoppedHours >= s.workedHours));
  // Ociosa = baja utilización por falta de carga (no por estar detenida: eso ya es un cuello de botella).
  const idle = withCapacity.filter((s) => s.utilizationPct < IDLE_UTIL && s.idleHours > s.stoppedHours).sort((a, b) => b.idleHours * b.operators - a.idleHours * a.operators);

  const bottlenecksAndIdle = [
    ...bottlenecks.map((s) => L.bottleneck(station(s), s.utilizationPct, s.stoppedHours > 0 ? h(s.stoppedHours) : '')),
    ...idle.map((s) => L.idle(station(s), s.utilizationPct, h(s.idleHours))),
  ];
  if (bottlenecksAndIdle.length === 0) bottlenecksAndIdle.push(L.noFindings);

  // Donantes: estaciones ociosas con al menos 2 operadores (nunca se deja una estación en 0).
  const donors = idle.filter((s) => s.operators >= 2);
  const receivers = byLoad.filter((s) => s.utilizationPct >= 70 && !donors.includes(s));
  const staffReorganization: string[] = [];
  donors.forEach((donor, i) => {
    const receiver = receivers[i];
    staffReorganization.push(
      receiver
        ? L.moveOperator(station(donor), station(receiver), h(donor.idleHours), receiver.utilizationPct)
        : L.toTraining(station(donor), h(donor.idleHours * donor.operators)),
    );
  });
  const staffShortage = snapshot.stopCauses.find((c) => c.reason === 'FALTA_PERSONAL');
  if (staffShortage) staffReorganization.push(L.staffShortage(h(staffShortage.hours)));
  if (staffReorganization.length === 0) staffReorganization.push(L.balanced);

  const totalStopHours = snapshot.stopCauses.reduce((sum, c) => sum + c.hours, 0);
  const rootCauseAnalysis = snapshot.stopCauses.slice(0, 4).map((c) =>
    L.cause(
      c.reason ? formatDelayReason(c.reason, language) : t.bi.unclassifiedCause,
      c.count,
      h(c.hours),
      totalStopHours > 0 ? Math.round((c.hours / totalStopHours) * 100) : 0,
      L.causeActions[c.reason ?? 'UNCLASSIFIED'],
    ),
  );
  if (rootCauseAnalysis.length === 0) rootCauseAnalysis.push(L.noStops);

  return { executiveSummary, bottlenecksAndIdle, staffReorganization, rootCauseAnalysis, source: 'local' };
}

/**
 * Genera el informe con IA (función serverless → Gemini o Claude). Nunca lanza: ante
 * cualquier falla (sin key, sin red, timeout, respuesta inválida) devuelve el
 * análisis del motor local, marcado con `source: 'local'` para que la UI lo diga.
 */
export async function generateBiAnalysis(snapshot: BiKpiSnapshot, language: Language, t: Strings): Promise<BiAiAnalysis> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ language, metrics: toAiMetrics(snapshot, language, t) }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: unknown = await res.json();
    if (!isAnalysisPayload(data)) throw new Error('Respuesta con formato inesperado');
    const provider = (data as { provider?: unknown }).provider;
    return {
      executiveSummary: data.executiveSummary,
      bottlenecksAndIdle: data.bottlenecksAndIdle,
      staffReorganization: data.staffReorganization,
      rootCauseAnalysis: data.rootCauseAnalysis,
      source: provider === 'claude' ? 'claude' : 'gemini',
    };
  } catch {
    return buildLocalAnalysis(snapshot, language, t);
  } finally {
    clearTimeout(timer);
  }
}

/** Texto plano de las columnas `resumen_ia` / `recomendaciones_dotacion`. */
export function analysisToText(analysis: BiAiAnalysis, t: Strings): { summaryText: string; staffingText: string } {
  const bullets = (items: string[]) => items.map((i) => `• ${i}`).join('\n');
  return {
    summaryText: [
      `${t.bi.sectionSummary}\n${analysis.executiveSummary}`,
      `${t.bi.sectionBottlenecks}\n${bullets(analysis.bottlenecksAndIdle)}`,
      `${t.bi.sectionRootCause}\n${bullets(analysis.rootCauseAnalysis)}`,
    ].join('\n\n'),
    staffingText: bullets(analysis.staffReorganization),
  };
}
