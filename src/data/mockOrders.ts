import { STATIONS, type OrderStatus, type Priority, type Station, type TraceabilityEvent, type WorkOrder } from '../types/order';
import { STATION_META } from './mockStations';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * DAY_MS).toISOString();
}

const OPERATORS_BY_STATION: Record<Station, string> = {
  ORDEN_COMPRA: 'Sergio Contreras',
  COMPRA_INSUMOS: 'Paulina Reyes',
  CORTE: 'Juan Carlos Soto',
  ARMADO_SOLDADURA: 'Ignacio Peña',
  PINTURA: 'Fernanda Muñoz',
  CONTROL_CALIDAD: 'Rodrigo Álvarez',
  DESPACHO: 'Camila Torres',
};

type DelayProfile = 'ON_TIME' | 'AT_RISK' | 'LATE' | 'STOPPED' | 'DONE';

const INCIDENT_NOTES: Record<Station, string> = {
  ORDEN_COMPRA: 'A la espera de validación final del cliente sobre la OC.',
  COMPRA_INSUMOS: 'Esperando plancha de acero A36 10mm del proveedor.',
  CORTE: 'Máquina de corte plasma en mantención correctiva.',
  ARMADO_SOLDADURA: 'Soldador principal con licencia médica, cuadrilla reducida.',
  PINTURA: 'Esperando pintura epóxica RAL específica del proveedor.',
  CONTROL_CALIDAD: 'Observación de inspector: revisar cordones de soldadura antes de continuar.',
  DESPACHO: 'A la espera de camión con capacidad para carga sobredimensionada.',
};

interface OrderSeed {
  id: string;
  purchaseOrderId: string;
  clientName: string;
  projectName: string;
  structureType: string;
  dimensions: string;
  weightTons: number;
  paintSpecification: string;
  orderedDaysAgo: number;
  promisedInDays: number;
  priority: Priority;
  /** Cuántas estaciones ya completó (0 = recién en Orden de Compra, 7 = completó Despacho). */
  stationsCompleted: number;
  profile: DelayProfile;
}

const SEEDS: OrderSeed[] = [
  { id: 'OT-1042', purchaseOrderId: 'OC-2026-880', clientName: 'Constructora Andes SpA', projectName: 'Galpón Industrial Lote 4', structureType: 'Galpón industrial', dimensions: '40m x 20m x 8m', weightTons: 32.5, paintSpecification: 'Anticorrosivo + esmalte RAL 7016', orderedDaysAgo: 38, promisedInDays: -2, priority: 'ALTA', stationsCompleted: 7, profile: 'DONE' },
  { id: 'OT-1043', purchaseOrderId: 'OC-2026-880', clientName: 'Constructora Andes SpA', projectName: 'Vigas de Techumbre Nave 2', structureType: 'Vigas estructurales', dimensions: '12m largo x 24 unidades', weightTons: 14.8, paintSpecification: 'Anticorrosivo RAL 7016', orderedDaysAgo: 24, promisedInDays: -3, priority: 'ALTA', stationsCompleted: 3, profile: 'STOPPED' },
  { id: 'OT-1044', purchaseOrderId: 'OC-2026-881', clientName: 'Inmobiliaria Los Robles', projectName: 'Escalera Metálica Torre B', structureType: 'Escalera metálica', dimensions: '3m x 12m', weightTons: 2.1, paintSpecification: 'Esmalte sintético RAL 9005', orderedDaysAgo: 20, promisedInDays: 5, priority: 'NORMAL', stationsCompleted: 5, profile: 'ON_TIME' },
  { id: 'OT-1045', purchaseOrderId: 'OC-2026-881', clientName: 'Inmobiliaria Los Robles', projectName: 'Portón Corredizo Industrial', structureType: 'Portón industrial', dimensions: '6m x 4m', weightTons: 1.4, paintSpecification: 'Esmalte sintético RAL 9005', orderedDaysAgo: 8, promisedInDays: 6, priority: 'BAJA', stationsCompleted: 2, profile: 'ON_TIME' },
  { id: 'OT-1046', purchaseOrderId: 'OC-2026-882', clientName: 'Minera El Cobre Ltda.', projectName: 'Pasarela de Acceso Planta Norte', structureType: 'Pasarela peatonal', dimensions: '25m x 2m', weightTons: 8.4, paintSpecification: 'Galvanizado en caliente', orderedDaysAgo: 25, promisedInDays: 3, priority: 'ALTA', stationsCompleted: 4, profile: 'AT_RISK' },
  { id: 'OT-1047', purchaseOrderId: 'OC-2026-882', clientName: 'Minera El Cobre Ltda.', projectName: 'Barandas de Seguridad Nivel 2', structureType: 'Baranda de seguridad', dimensions: '80m lineales', weightTons: 3.6, paintSpecification: 'Galvanizado en caliente', orderedDaysAgo: 18, promisedInDays: -1, priority: 'NORMAL', stationsCompleted: 4, profile: 'AT_RISK' },
  { id: 'OT-1048', purchaseOrderId: 'OC-2026-882', clientName: 'Minera El Cobre Ltda.', projectName: 'Soporte de Tuberías Planta Norte', structureType: 'Soporte de tuberías', dimensions: '35m lineales', weightTons: 7.1, paintSpecification: 'Galvanizado en caliente', orderedDaysAgo: 10, promisedInDays: 9, priority: 'NORMAL', stationsCompleted: 1, profile: 'ON_TIME' },
  { id: 'OT-1049', purchaseOrderId: 'OC-2026-883', clientName: 'Agroindustrial San Pedro', projectName: 'Silo Metálico 200 Ton', structureType: 'Silo', dimensions: 'Ø8m x 12m', weightTons: 18.7, paintSpecification: 'Anticorrosivo epóxico', orderedDaysAgo: 30, promisedInDays: -5, priority: 'URGENTE', stationsCompleted: 5, profile: 'LATE' },
  { id: 'OT-1050', purchaseOrderId: 'OC-2026-883', clientName: 'Agroindustrial San Pedro', projectName: 'Silo Metálico 350 Ton', structureType: 'Silo', dimensions: 'Ø10m x 14m', weightTons: 24.6, paintSpecification: 'Anticorrosivo epóxico', orderedDaysAgo: 40, promisedInDays: -12, priority: 'URGENTE', stationsCompleted: 6, profile: 'LATE' },
  { id: 'OT-1051', purchaseOrderId: 'OC-2026-883', clientName: 'Agroindustrial San Pedro', projectName: 'Plataforma de Carga Camiones', structureType: 'Plataforma de carga', dimensions: '10m x 6m', weightTons: 6.3, paintSpecification: 'Anticorrosivo epóxico', orderedDaysAgo: 27, promisedInDays: -8, priority: 'URGENTE', stationsCompleted: 6, profile: 'LATE' },
  { id: 'OT-1052', purchaseOrderId: 'OC-2026-884', clientName: 'Puerto Seco Lampa', projectName: 'Estructura Techumbre Andén 5', structureType: 'Techumbre metálica', dimensions: '50m x 15m', weightTons: 27.9, paintSpecification: 'Anticorrosivo + esmalte RAL 7016', orderedDaysAgo: 33, promisedInDays: 1, priority: 'ALTA', stationsCompleted: 5, profile: 'AT_RISK' },
  { id: 'OT-1053', purchaseOrderId: 'OC-2026-884', clientName: 'Puerto Seco Lampa', projectName: 'Rack de Estanterías Industriales', structureType: 'Rack industrial', dimensions: '30m x 4m x 10m', weightTons: 22.0, paintSpecification: 'Anticorrosivo RAL 5010', orderedDaysAgo: 22, promisedInDays: 2, priority: 'ALTA', stationsCompleted: 3, profile: 'STOPPED' },
  { id: 'OT-1054', purchaseOrderId: 'OC-2026-884', clientName: 'Puerto Seco Lampa', projectName: 'Contenedor Modular Oficina Terreno', structureType: 'Módulo prefabricado', dimensions: '6m x 3m x 2.6m', weightTons: 4.2, paintSpecification: 'Esmalte sintético RAL 9010', orderedDaysAgo: 17, promisedInDays: 4, priority: 'BAJA', stationsCompleted: 6, profile: 'ON_TIME' },
  { id: 'OT-1055', purchaseOrderId: 'OC-2026-885', clientName: 'Frigorífico Sur SA', projectName: 'Estructura Cámara de Frío', structureType: 'Estructura industrial', dimensions: '18m x 10m x 6m', weightTons: 9.8, paintSpecification: 'Esmalte poliuretano RAL 9010', orderedDaysAgo: 12, promisedInDays: 14, priority: 'BAJA', stationsCompleted: 1, profile: 'ON_TIME' },
  { id: 'OT-1056', purchaseOrderId: 'OC-2026-885', clientName: 'Frigorífico Sur SA', projectName: 'Escalera de Emergencia Norte', structureType: 'Escalera metálica', dimensions: '4m x 15m', weightTons: 2.8, paintSpecification: 'Esmalte poliuretano RAL 1023', orderedDaysAgo: 5, promisedInDays: 12, priority: 'NORMAL', stationsCompleted: 0, profile: 'ON_TIME' },
  { id: 'OT-1057', purchaseOrderId: 'OC-2026-886', clientName: 'Transportes Cordillera SA', projectName: 'Cercha Techumbre Bodega Repuestos', structureType: 'Cercha metálica', dimensions: '20m luz x 8 unidades', weightTons: 11.4, paintSpecification: 'Anticorrosivo RAL 5010', orderedDaysAgo: 15, promisedInDays: 7, priority: 'NORMAL', stationsCompleted: 2, profile: 'ON_TIME' },
  { id: 'OT-1058', purchaseOrderId: 'OC-2026-887', clientName: 'Viña Los Álamos', projectName: 'Mezzanine Bodega de Barricas', structureType: 'Mezzanine', dimensions: '20m x 12m x 4m', weightTons: 14.5, paintSpecification: 'Anticorrosivo RAL 5010', orderedDaysAgo: 46, promisedInDays: -20, priority: 'ALTA', stationsCompleted: 7, profile: 'DONE' },
];

/** Duración real de una estación según el perfil de la OT: qué tan lejos se desvía del estándar. */
function actualHoursFor(standard: number, profile: DelayProfile, isLastEntered: boolean): number {
  switch (profile) {
    case 'ON_TIME':
    case 'DONE':
      return Math.round(standard * (0.9 + Math.random() * 0.15) * 10) / 10;
    case 'AT_RISK':
      return Math.round(standard * (1.1 + Math.random() * 0.25) * 10) / 10;
    case 'LATE':
      return Math.round(standard * (1.4 + Math.random() * 0.4) * 10) / 10;
    case 'STOPPED':
      return isLastEntered ? Math.round(standard * 2.5 * 10) / 10 : Math.round(standard * 1.1 * 10) / 10;
  }
}

let eventSeq = 0;
function nextEventId(orderId: string): string {
  eventSeq += 1;
  return `${orderId}-ev-${eventSeq}`;
}

function buildHistory(seed: OrderSeed): { history: TraceabilityEvent[]; currentStation: Station; lastMovementAt: string } {
  const history: TraceabilityEvent[] = [];
  const stationsToBuild = Math.min(Math.max(seed.stationsCompleted + (seed.profile === 'DONE' ? 0 : 1), 1), STATIONS.length);
  let cursorDaysAgo = seed.orderedDaysAgo;
  let lastMovementAt = daysAgo(seed.orderedDaysAgo);

  for (let i = 0; i < stationsToBuild; i++) {
    const station = STATIONS[i];
    const meta = STATION_META[station];
    const isCurrent = i === stationsToBuild - 1;
    const isCompleted = i < seed.stationsCompleted;
    const actualHours = isCompleted || (isCurrent && seed.profile === 'STOPPED')
      ? actualHoursFor(meta.standardHours, seed.profile, isCurrent)
      : null;

    const enterTimestamp = daysAgo(cursorDaysAgo);
    history.push({
      id: nextEventId(seed.id),
      type: 'STATION_ENTER',
      station,
      timestamp: enterTimestamp,
      actor: OPERATORS_BY_STATION[station],
    });
    lastMovementAt = enterTimestamp;

    if (isCurrent && seed.profile === 'STOPPED') {
      const noteTimestamp = daysAgo(Math.max(cursorDaysAgo - 0.5, 0));
      history.push({
        id: nextEventId(seed.id),
        type: 'HOLD',
        station,
        timestamp: noteTimestamp,
        actor: OPERATORS_BY_STATION[station],
        note: INCIDENT_NOTES[station],
      });
      lastMovementAt = noteTimestamp;
    }

    if (isCompleted) {
      const exitTimestamp = daysAgo(Math.max(cursorDaysAgo - (actualHours ?? meta.standardHours) / 24, 0));
      history.push({
        id: nextEventId(seed.id),
        type: 'STATION_EXIT',
        station,
        timestamp: exitTimestamp,
        actor: OPERATORS_BY_STATION[station],
      });
      lastMovementAt = exitTimestamp;
      cursorDaysAgo = Math.max(cursorDaysAgo - (actualHours ?? meta.standardHours) / 24, 0);
    }
  }

  const currentStation = seed.profile === 'DONE' ? 'DESPACHO' : STATIONS[stationsToBuild - 1];
  return { history, currentStation, lastMovementAt };
}

function deriveStatus(seed: OrderSeed): OrderStatus {
  if (seed.profile === 'DONE') return 'COMPLETADO';
  if (seed.profile === 'STOPPED') return 'DETENIDO';
  if (seed.profile === 'LATE') return 'ATRASADO';
  if (seed.profile === 'AT_RISK') return 'EN_RIESGO';
  return 'EN_TIEMPO';
}

function deriveProgress(seed: OrderSeed): number {
  if (seed.profile === 'DONE') return 100;
  const base = (seed.stationsCompleted / STATIONS.length) * 100;
  const partial = (1 / STATIONS.length) * 40;
  return Math.min(Math.round(base + partial), 99);
}

function buildWorkOrder(seed: OrderSeed): WorkOrder {
  const { history, currentStation, lastMovementAt } = buildHistory(seed);
  return {
    id: seed.id,
    purchaseOrderId: seed.purchaseOrderId,
    clientName: seed.clientName,
    projectName: seed.projectName,
    productSpecs: {
      structureType: seed.structureType,
      dimensions: seed.dimensions,
      weightTons: seed.weightTons,
      paintSpecification: seed.paintSpecification,
    },
    orderDate: daysAgo(seed.orderedDaysAgo),
    promisedDate: daysFromNow(seed.promisedInDays),
    priority: seed.priority,
    currentStation,
    status: deriveStatus(seed),
    progressPercentage: deriveProgress(seed),
    assignedOperator: OPERATORS_BY_STATION[currentStation],
    lastMovementAt,
    history,
  };
}

export const mockOrders: WorkOrder[] = SEEDS.map(buildWorkOrder);
