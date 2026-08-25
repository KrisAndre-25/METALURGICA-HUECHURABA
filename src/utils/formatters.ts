import type { Language } from '../types/language';

function dateFormatter(language: Language) {
  return language === 'en'
    ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ufFormatter(language: Language) {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}

export function formatDate(iso: string, language: Language = 'es'): string {
  return dateFormatter(language).format(new Date(iso));
}

export function formatUF(amount: number, language: Language = 'es'): string {
  return `${ufFormatter(language).format(amount)} UF`;
}

export function formatHours(hours: number | null, language: Language = 'es'): string {
  if (hours === null) return '—';
  if (hours < 24) return language === 'en' ? `${hours.toFixed(1)} h` : `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} d`;
}

export function formatTons(tons: number): string {
  return `${tons.toFixed(1)} ton`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

const STATUS_LABELS: Record<Language, Record<string, string>> = {
  es: {
    EN_TIEMPO: 'En tiempo',
    EN_RIESGO: 'En riesgo',
    ATRASADO: 'Atrasado',
    DETENIDO: 'Detenido',
    COMPLETADO: 'Completado',
  },
  en: {
    EN_TIEMPO: 'On time',
    EN_RIESGO: 'At risk',
    ATRASADO: 'Late',
    DETENIDO: 'Stopped',
    COMPLETADO: 'Completed',
  },
};

export function formatStatus(status: string, language: Language = 'es'): string {
  return STATUS_LABELS[language][status] ?? status;
}

const STATION_LABELS: Record<Language, Record<string, string>> = {
  es: {
    ORDEN_COMPRA: 'Orden de Compra',
    COMPRA_INSUMOS: 'Compra de Insumos',
    CORTE: 'Corte',
    ARMADO_SOLDADURA: 'Armado y Soldadura',
    PINTURA: 'Pintura',
    CONTROL_CALIDAD: 'Control de Calidad',
    DESPACHO: 'Despacho',
  },
  en: {
    ORDEN_COMPRA: 'Purchase Order',
    COMPRA_INSUMOS: 'Supplies Purchasing',
    CORTE: 'Cutting',
    ARMADO_SOLDADURA: 'Assembly & Welding',
    PINTURA: 'Painting',
    CONTROL_CALIDAD: 'Quality Control',
    DESPACHO: 'Dispatch',
  },
};

export function formatStation(station: string, language: Language = 'es'): string {
  return STATION_LABELS[language][station] ?? station;
}

const STATION_SHORT_LABELS: Record<Language, Record<string, string>> = {
  es: {
    ORDEN_COMPRA: 'OC',
    COMPRA_INSUMOS: 'Insumos',
    CORTE: 'Corte',
    ARMADO_SOLDADURA: 'Armado',
    PINTURA: 'Pintura',
    CONTROL_CALIDAD: 'Calidad',
    DESPACHO: 'Despacho',
  },
  en: {
    ORDEN_COMPRA: 'PO',
    COMPRA_INSUMOS: 'Supplies',
    CORTE: 'Cutting',
    ARMADO_SOLDADURA: 'Assembly',
    PINTURA: 'Paint',
    CONTROL_CALIDAD: 'Quality',
    DESPACHO: 'Dispatch',
  },
};

export function formatStationShort(station: string, language: Language = 'es'): string {
  return STATION_SHORT_LABELS[language][station] ?? station;
}

const EVENT_LABELS: Record<Language, Record<string, string>> = {
  es: {
    STATION_ENTER: 'Ingresó a',
    STATION_EXIT: 'Salió de',
    NOTE: 'Nota en',
    PRIORITY_CHANGE: 'Cambio de prioridad en',
    REASSIGNMENT: 'Reasignación en',
    HOLD: 'Detenida en',
    RESUME: 'Reanudada en',
  },
  en: {
    STATION_ENTER: 'Entered',
    STATION_EXIT: 'Left',
    NOTE: 'Note at',
    PRIORITY_CHANGE: 'Priority change at',
    REASSIGNMENT: 'Reassignment at',
    HOLD: 'Stopped at',
    RESUME: 'Resumed at',
  },
};

export function formatEventType(type: string, language: Language = 'es'): string {
  return EVENT_LABELS[language][type] ?? type;
}

const ROLE_LABELS: Record<Language, Record<string, string>> = {
  es: {
    ADMIN: 'Administración',
    OPERATOR: 'Taller/Oficina',
    VENDEDOR: 'Vendedor',
    CLIENT: 'Cliente',
  },
  en: {
    ADMIN: 'Admin',
    OPERATOR: 'Shop/Office',
    VENDEDOR: 'Sales Rep',
    CLIENT: 'Client',
  },
};

export function formatRole(role: string, language: Language = 'es'): string {
  return ROLE_LABELS[language][role] ?? role;
}

const PRIORITY_LABELS: Record<Language, Record<string, string>> = {
  es: { BAJA: 'Baja', NORMAL: 'Normal', ALTA: 'Alta', URGENTE: 'Urgente' },
  en: { BAJA: 'Low', NORMAL: 'Normal', ALTA: 'High', URGENTE: 'Urgent' },
};

export function formatPriority(priority: string, language: Language = 'es'): string {
  return PRIORITY_LABELS[language][priority] ?? priority;
}

const DELAY_REASON_LABELS: Record<Language, Record<string, string>> = {
  es: {
    AVERIA_MAQUINARIA: 'Avería / Falla de Maquinaria',
    FALTA_INSUMOS: 'Falta de Insumos / Material varado',
    FALTA_PERSONAL: 'Falta de Personal',
    CORTE_LUZ: 'Corte de Luz / Suministro eléctrico',
    ESPERA_INSPECCION: 'Espera de Inspección / Control de Calidad',
  },
  en: {
    AVERIA_MAQUINARIA: 'Machinery Breakdown / Failure',
    FALTA_INSUMOS: 'Missing Supplies / Stranded Material',
    FALTA_PERSONAL: 'Staff Shortage',
    CORTE_LUZ: 'Power Outage',
    ESPERA_INSPECCION: 'Waiting on Inspection / Quality Control',
  },
};

export function formatDelayReason(reason: string, language: Language = 'es'): string {
  return DELAY_REASON_LABELS[language][reason] ?? reason;
}

/** Número de guía de despacho simulado — estable y determinístico a partir del ID de la OT. */
export function formatDispatchGuide(orderId: string): string {
  const digits = orderId.replace(/\D/g, '').padStart(4, '0');
  return `GD-${new Date().getFullYear()}-${digits}`;
}

/** Fecha y hora completas (para timestamps de salida de taller, no solo fecha). */
export function formatDateTime(iso: string, language: Language = 'es'): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Tiempo relativo corto ("hace 5 min", "hace 3 h", "hace 2 d") para UI móvil compacta. */
export function formatRelativeTime(iso: string, language: Language = 'es'): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (language === 'en') {
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} h ago`;
    const days = Math.round(hours / 24);
    return `${days} d ago`;
  }
  if (minutes < 1) return 'recién';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}
