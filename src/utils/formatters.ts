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
