const dateFormatter = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
const ufFormatter = new Intl.NumberFormat('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatUF(amount: number): string {
  return `${ufFormatter.format(amount)} UF`;
}

export function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

export function formatTons(tons: number): string {
  return `${tons.toFixed(1)} ton`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

const STATUS_LABELS: Record<string, string> = {
  EN_TIEMPO: 'En tiempo',
  EN_RIESGO: 'En riesgo',
  ATRASADO: 'Atrasado',
  DETENIDO: 'Detenido',
  COMPLETADO: 'Completado',
};

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

const STATION_LABELS: Record<string, string> = {
  ORDEN_COMPRA: 'Orden de Compra',
  COMPRA_INSUMOS: 'Compra de Insumos',
  CORTE: 'Corte',
  ARMADO_SOLDADURA: 'Armado y Soldadura',
  PINTURA: 'Pintura',
  CONTROL_CALIDAD: 'Control de Calidad',
  DESPACHO: 'Despacho',
};

export function formatStation(station: string): string {
  return STATION_LABELS[station] ?? station;
}

const EVENT_LABELS: Record<string, string> = {
  STATION_ENTER: 'Ingresó a',
  STATION_EXIT: 'Salió de',
  NOTE: 'Nota en',
  PRIORITY_CHANGE: 'Cambio de prioridad en',
  REASSIGNMENT: 'Reasignación en',
  HOLD: 'Detenida en',
  RESUME: 'Reanudada en',
};

export function formatEventType(type: string): string {
  return EVENT_LABELS[type] ?? type;
}

/** Tiempo relativo corto ("hace 5 min", "hace 3 h", "hace 2 d") para UI móvil compacta. */
export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}
