import { STATIONS, type DelayReason, type Station, type WorkOrder } from '../types/order';
import type { BiKpiSnapshot, BiReportType, StationCapacity, StationTimeStudy, StopCauseSummary } from '../types/bi';
import { STATION_META } from '../data/mockStations';

const HOUR_MS = 60 * 60 * 1000;
const HOURS_PER_WEEK = 168;

/** Intervalo [inicio, fin) en milisegundos epoch. */
type Interval = [number, number];

function union(intervals: Interval[]): Interval[] {
  const sorted = intervals.filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [s, e] of sorted) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  return merged;
}

/** A − B, ambos ya unidos (sin solapes internos). */
function subtract(a: Interval[], b: Interval[]): Interval[] {
  const result: Interval[] = [];
  for (const [start, end] of a) {
    let cursor = start;
    for (const [bs, be] of b) {
      if (be <= cursor || bs >= end) continue;
      if (bs > cursor) result.push([cursor, bs]);
      cursor = Math.max(cursor, be);
    }
    if (cursor < end) result.push([cursor, end]);
  }
  return result;
}

function clip(intervals: Interval[], [from, to]: Interval): Interval[] {
  return intervals.map(([s, e]) => [Math.max(s, from), Math.min(e, to)] as Interval).filter(([s, e]) => e > s);
}

function totalHours(intervals: Interval[]): number {
  return intervals.reduce((sum, [s, e]) => sum + (e - s), 0) / HOUR_MS;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

interface OrderStationTimeline {
  presence: Interval[];
  holds: { interval: Interval; reason: DelayReason | null }[];
  /** Pasadas completas (entrada y salida) por la estación, para el Rendimiento del OEE. */
  completedPasses: Interval[];
}

/**
 * Reconstruye, desde el historial de trazabilidad de una OT, cuándo estuvo en
 * cada estación (ENTER→EXIT, o hasta ahora si sigue ahí) y cuándo estuvo
 * detenida (HOLD→RESUME, o hasta ahora si sigue detenida).
 */
function buildTimeline(order: WorkOrder, now: number): Map<Station, OrderStationTimeline> {
  const timeline = new Map<Station, OrderStationTimeline>();
  const get = (station: Station) => {
    let entry = timeline.get(station);
    if (!entry) {
      entry = { presence: [], holds: [], completedPasses: [] };
      timeline.set(station, entry);
    }
    return entry;
  };

  const { history } = order;
  for (let i = 0; i < history.length; i++) {
    const event = history[i];
    const start = new Date(event.timestamp).getTime();

    if (event.type === 'STATION_ENTER') {
      const exit = history.slice(i + 1).find((e) => e.type === 'STATION_EXIT' && e.station === event.station);
      if (exit) {
        const pass: Interval = [start, new Date(exit.timestamp).getTime()];
        get(event.station).presence.push(pass);
        get(event.station).completedPasses.push(pass);
      } else if (order.currentStation === event.station && order.status !== 'COMPLETADO') {
        get(event.station).presence.push([start, now]);
      }
    }

    if (event.type === 'HOLD') {
      const resume = history.slice(i + 1).find((e) => e.type === 'RESUME');
      const end = resume ? new Date(resume.timestamp).getTime() : now;
      get(event.station).holds.push({ interval: [start, end], reason: event.delayReason ?? null });
    }
  }
  return timeline;
}

export const DEFAULT_WEEKLY_HOURS = 40;
export const DEFAULT_OPERATORS = 2;

export function defaultCapacities(): StationCapacity[] {
  return STATIONS.map((station) => ({ station, weeklyHours: DEFAULT_WEEKLY_HOURS, operators: DEFAULT_OPERATORS }));
}

/**
 * Estudio de tiempos por estación para la ventana [from, to].
 *
 * Una estación se clasifica en cada instante en UN solo estado, con prioridad
 * Trabajando > En parada > Ociosa: si una OT está detenida pero otra se sigue
 * procesando en la misma estación, esa estación NO perdió capacidad. Así las
 * cuatro barras siempre cuadran (Disponibles = Trabajadas + Parada + Ociosas)
 * y nunca aparecen horas ociosas negativas.
 *
 * El historial registra tiempo calendario (24/7), pero la estación solo opera
 * `weeklyHours` de las 168 h semanales: cada hora calendario se escala por
 * `weeklyHours / 168`. Para una ventana de 4 semanas, Disponibles = semanales × 4.
 */
export function calculateTimeStudy(
  orders: WorkOrder[],
  capacities: StationCapacity[],
  fromIso: string,
  toIso: string,
  nowMs: number = Date.now(),
): BiKpiSnapshot {
  const from = new Date(fromIso).getTime();
  // Una ventana que termina en el futuro (ej. "mes en curso") solo cuenta hasta ahora.
  const to = Math.min(new Date(toIso).getTime(), nowMs);
  const window: Interval = [from, Math.max(from, to)];
  const windowHours = totalHours([window]);

  const timelines = orders.map((o) => buildTimeline(o, nowMs));
  const capacityByStation = new Map(capacities.map((c) => [c.station, c]));

  const causeTotals = new Map<DelayReason | null, { count: number; hours: number }>();
  let standardHoursDone = 0;
  let actualHoursDone = 0;

  const stations: StationTimeStudy[] = STATIONS.map((station) => {
    const capacity = capacityByStation.get(station) ?? { station, weeklyHours: DEFAULT_WEEKLY_HOURS, operators: DEFAULT_OPERATORS };
    const shiftFactor = capacity.weeklyHours / HOURS_PER_WEEK;

    const activeIntervals: Interval[] = [];
    const holdIntervals: Interval[] = [];
    const stationHolds: OrderStationTimeline['holds'] = [];
    let stopCount = 0;

    for (const timeline of timelines) {
      const entry = timeline.get(station);
      if (!entry) continue;
      const orderHolds = union(entry.holds.map((h) => h.interval));
      activeIntervals.push(...subtract(union(entry.presence), orderHolds));
      holdIntervals.push(...orderHolds);

      stationHolds.push(...entry.holds);
      for (const hold of entry.holds) {
        // Cuenta toda parada vigente en la ventana, aunque haya empezado antes.
        const [start, end] = hold.interval;
        if (end <= window[0] || start >= window[1]) continue;
        stopCount += 1;
        const cause = causeTotals.get(hold.reason) ?? { count: 0, hours: 0 };
        cause.count += 1;
        causeTotals.set(hold.reason, cause);
      }

      for (const pass of entry.completedPasses) {
        if (pass[1] < window[0] || pass[1] > window[1]) continue;
        standardHoursDone += STATION_META[station].standardHours;
        actualHoursDone += totalHours(subtract([pass], orderHolds));
      }
    }

    const working = clip(union(activeIntervals), window);
    const stopped = subtract(clip(union(holdIntervals), window), working);

    // Cada hora que la estación estuvo detenida se atribuye a UNA causa (la de la
    // parada más antigua vigente en ese momento), así las horas por causa suman
    // exactamente las horas en parada y no se duplican con paradas simultáneas.
    let unattributed = stopped;
    for (const hold of [...stationHolds].sort((a, b) => a.interval[0] - b.interval[0])) {
      if (unattributed.length === 0) break;
      const portion = clip(unattributed, hold.interval);
      const hours = totalHours(portion) * shiftFactor;
      if (hours === 0) continue;
      const cause = causeTotals.get(hold.reason) ?? { count: 0, hours: 0 };
      cause.hours += hours;
      causeTotals.set(hold.reason, cause);
      unattributed = subtract(unattributed, [hold.interval]);
    }

    const availableHours = windowHours * shiftFactor;
    const workedHours = totalHours(working) * shiftFactor;
    const stoppedHours = totalHours(stopped) * shiftFactor;
    const idleHours = Math.max(availableHours - workedHours - stoppedHours, 0);

    return {
      station,
      operators: capacity.operators,
      availableHours: round1(availableHours),
      workedHours: round1(workedHours),
      stoppedHours: round1(stoppedHours),
      idleHours: round1(idleHours),
      utilizationPct: availableHours > 0 ? Math.round((workedHours / availableHours) * 100) : 0,
      stopCount,
    };
  });

  const sum = (pick: (s: StationTimeStudy) => number) => stations.reduce((acc, s) => acc + pick(s), 0);
  const totalAvailableHours = sum((s) => s.availableHours);
  const totalWorkedHours = sum((s) => s.workedHours);
  const totalStoppedHours = sum((s) => s.stoppedHours);
  const totalIdleHours = sum((s) => s.idleHours);

  // OEE = Disponibilidad × Rendimiento × Calidad.
  // Disponibilidad: del tiempo con carga (trabajando o detenida), cuánto se trabajó.
  const loaded = totalWorkedHours + totalStoppedHours;
  const availability = loaded > 0 ? totalWorkedHours / loaded : 1;
  // Rendimiento: horas estándar de las pasadas terminadas vs. las que realmente tomaron.
  const performance = actualHoursDone > 0 ? Math.min(standardHoursDone / actualHoursDone, 1) : 1;
  // Calidad: la app aún no registra reprocesos/rechazos — se asume 100% hasta tener ese dato.
  const quality = 1;

  const staffAvailable = sum((s) => s.availableHours * s.operators);
  const staffWorked = sum((s) => s.workedHours * s.operators);

  const stopCauses: StopCauseSummary[] = Array.from(causeTotals.entries())
    .map(([reason, { count, hours }]) => ({ reason, count, hours: round1(hours) }))
    .sort((a, b) => b.hours - a.hours);

  return {
    from: new Date(window[0]).toISOString(),
    to: new Date(window[1]).toISOString(),
    oeePct: Math.round(availability * performance * quality * 100),
    availabilityPct: Math.round(availability * 100),
    performancePct: Math.round(performance * 100),
    qualityPct: Math.round(quality * 100),
    totalAvailableHours: round1(totalAvailableHours),
    totalWorkedHours: round1(totalWorkedHours),
    totalStoppedHours: round1(totalStoppedHours),
    totalIdleHours: round1(totalIdleHours),
    staffUtilizationPct: staffAvailable > 0 ? Math.round((staffWorked / staffAvailable) * 100) : 0,
    stations,
    stopCauses,
  };
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Primer y último instante del mes calendario que contiene `date` (hora local). */
export function monthBounds(date: Date): { from: Date; to: Date } {
  const from = new Date(date.getFullYear(), date.getMonth(), 1);
  const to = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, -1);
  return { from, to };
}

/**
 * Ventana de fechas para cada tipo de reporte, anclada a `now`. MENSUAL es el
 * mes calendario en curso — la misma ventana del dashboard activo, que se
 * "reinicia" sola el día 1 porque siempre se calcula desde el día 1 del mes.
 */
export function windowForReportType(type: Exclude<BiReportType, 'A_PEDIDO' | 'CIERRE_MES'>, now: Date = new Date()): { from: Date; to: Date } {
  if (type === 'DIARIO') return { from: startOfDay(now), to: now };
  if (type === 'SEMANAL') {
    const from = startOfDay(now);
    from.setDate(from.getDate() - 6);
    return { from, to: now };
  }
  return { from: monthBounds(now).from, to: now };
}

/** `YYYY-MM-DD` (input type=date) → rango de día completo en hora local. */
export function parseDateInputRange(fromValue: string, toValue: string): { from: Date; to: Date } | null {
  const [fy, fm, fd] = fromValue.split('-').map(Number);
  const [ty, tm, td] = toValue.split('-').map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return null;
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td, 23, 59, 59, 999);
  return to > from ? { from, to } : null;
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
