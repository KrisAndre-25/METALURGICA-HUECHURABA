import { STATIONS, type Station } from '../types/order';

export interface StationMeta {
  key: Station;
  label: string;
  shortLabel: string;
  order: number;
  standardHours: number;
}

/** Metadata fija de las 7 estaciones: orden de secuencia y duración estándar esperada. */
export const STATION_META: Record<Station, StationMeta> = {
  ORDEN_COMPRA: { key: 'ORDEN_COMPRA', label: 'Orden de Compra', shortLabel: 'OC', order: 0, standardHours: 4 },
  COMPRA_INSUMOS: { key: 'COMPRA_INSUMOS', label: 'Compra de Insumos', shortLabel: 'Insumos', order: 1, standardHours: 48 },
  CORTE: { key: 'CORTE', label: 'Corte', shortLabel: 'Corte', order: 2, standardHours: 16 },
  ARMADO_SOLDADURA: { key: 'ARMADO_SOLDADURA', label: 'Armado y Soldadura', shortLabel: 'Armado', order: 3, standardHours: 40 },
  PINTURA: { key: 'PINTURA', label: 'Pintura', shortLabel: 'Pintura', order: 4, standardHours: 20 },
  CONTROL_CALIDAD: { key: 'CONTROL_CALIDAD', label: 'Control de Calidad', shortLabel: 'Calidad', order: 5, standardHours: 8 },
  DESPACHO: { key: 'DESPACHO', label: 'Despacho', shortLabel: 'Despacho', order: 6, standardHours: 4 },
};

export const STATION_LIST: StationMeta[] = STATIONS.map((s) => STATION_META[s]);
