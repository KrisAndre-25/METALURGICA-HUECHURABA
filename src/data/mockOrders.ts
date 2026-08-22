import { STATIONS, type OrderStatus, type Priority, type PurchaseOrder, type Station, type StationHistoryEntry, type WorkOrder } from '../types/order';
import { STATION_META } from './mockStations';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * DAY_MS).toISOString();
}

const RESPONSIBLES = ['Juan Carlos Soto', 'Ignacio Peña', 'Fernanda Muñoz', 'Rodrigo Álvarez', 'Camila Torres', 'Paulina Reyes'];

type DelayProfile = 'ON_TIME' | 'AT_RISK' | 'LATE' | 'STOPPED';

interface OrderSeed {
  id: string;
  purchaseOrderId: string;
  clientName: string;
  clientRut: string;
  projectName: string;
  structureType: string;
  dimensions: string;
  weightTons: number;
  paintSpecification: string;
  totalAmountUF: number;
  orderedDaysAgo: number;
  promisedInDays: number;
  priority: Priority;
  /** Cuántas estaciones ya completó (0 = recién en Orden de Compra). */
  stationsCompleted: number;
  /** Si sigue avanzando en la estación actual (true) o quedó detenida ahí (false). */
  inProgress: boolean;
  profile: DelayProfile;
}

const SEEDS: OrderSeed[] = [
  { id: 'OT-2026-001', purchaseOrderId: 'OC-2026-001', clientName: 'Constructora Andes SpA', clientRut: '76.123.456-7', projectName: 'Galpón Industrial Lote 4', structureType: 'Galpón industrial', dimensions: '40m x 20m x 8m', weightTons: 32.5, paintSpecification: 'Anticorrosivo + esmalte RAL 7016', totalAmountUF: 1850, orderedDaysAgo: 38, promisedInDays: -2, priority: 'ALTA', stationsCompleted: 7, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-002', purchaseOrderId: 'OC-2026-002', clientName: 'Inmobiliaria Los Robles', clientRut: '77.234.567-8', projectName: 'Escalera Metálica Torre B', structureType: 'Escalera metálica', dimensions: '3m x 12m', weightTons: 2.1, paintSpecification: 'Esmalte sintético RAL 9005', totalAmountUF: 210, orderedDaysAgo: 20, promisedInDays: 5, priority: 'MEDIA', stationsCompleted: 5, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-003', purchaseOrderId: 'OC-2026-003', clientName: 'Minera El Cobre Ltda.', clientRut: '78.345.678-9', projectName: 'Pasarela de Acceso Planta Norte', structureType: 'Pasarela peatonal', dimensions: '25m x 2m', weightTons: 8.4, paintSpecification: 'Galvanizado en caliente', totalAmountUF: 640, orderedDaysAgo: 25, promisedInDays: 3, priority: 'ALTA', stationsCompleted: 4, inProgress: true, profile: 'AT_RISK' },
  { id: 'OT-2026-004', purchaseOrderId: 'OC-2026-004', clientName: 'Agroindustrial San Pedro', clientRut: '79.456.789-0', projectName: 'Silo Metálico 200 Ton', structureType: 'Silo', dimensions: 'Ø8m x 12m', weightTons: 18.7, paintSpecification: 'Anticorrosivo epóxico', totalAmountUF: 1200, orderedDaysAgo: 30, promisedInDays: -5, priority: 'URGENTE', stationsCompleted: 5, inProgress: true, profile: 'LATE' },
  { id: 'OT-2026-005', purchaseOrderId: 'OC-2026-005', clientName: 'Constructora Andes SpA', clientRut: '76.123.456-7', projectName: 'Estructura Soporte Bodega 3', structureType: 'Estructura de soporte', dimensions: '15m x 15m x 6m', weightTons: 11.2, paintSpecification: 'Esmalte sintético RAL 7035', totalAmountUF: 540, orderedDaysAgo: 15, promisedInDays: 10, priority: 'MEDIA', stationsCompleted: 2, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-006', purchaseOrderId: 'OC-2026-006', clientName: 'Puerto Seco Lampa', clientRut: '80.567.890-1', projectName: 'Rack de Estanterías Industriales', structureType: 'Rack industrial', dimensions: '30m x 4m x 10m', weightTons: 22.0, paintSpecification: 'Anticorrosivo RAL 5010', totalAmountUF: 980, orderedDaysAgo: 22, promisedInDays: 2, priority: 'ALTA', stationsCompleted: 3, inProgress: false, profile: 'STOPPED' },
  { id: 'OT-2026-007', purchaseOrderId: 'OC-2026-007', clientName: 'Frigorífico Sur SA', clientRut: '81.678.901-2', projectName: 'Estructura Cámara de Frío', structureType: 'Estructura industrial', dimensions: '18m x 10m x 6m', weightTons: 9.8, paintSpecification: 'Esmalte poliuretano RAL 9010', totalAmountUF: 720, orderedDaysAgo: 12, promisedInDays: 14, priority: 'BAJA', stationsCompleted: 1, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-008', purchaseOrderId: 'OC-2026-008', clientName: 'Minera El Cobre Ltda.', clientRut: '78.345.678-9', projectName: 'Barandas de Seguridad Nivel 2', structureType: 'Baranda de seguridad', dimensions: '80m lineales', weightTons: 3.6, paintSpecification: 'Galvanizado en caliente', totalAmountUF: 310, orderedDaysAgo: 18, promisedInDays: -1, priority: 'MEDIA', stationsCompleted: 4, inProgress: true, profile: 'AT_RISK' },
  { id: 'OT-2026-009', purchaseOrderId: 'OC-2026-009', clientName: 'Inmobiliaria Los Robles', clientRut: '77.234.567-8', projectName: 'Portón Corredizo Industrial', structureType: 'Portón industrial', dimensions: '6m x 4m', weightTons: 1.4, paintSpecification: 'Esmalte sintético RAL 9005', totalAmountUF: 165, orderedDaysAgo: 8, promisedInDays: 6, priority: 'BAJA', stationsCompleted: 2, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-010', purchaseOrderId: 'OC-2026-010', clientName: 'Agroindustrial San Pedro', clientRut: '79.456.789-0', projectName: 'Plataforma de Carga Camiones', structureType: 'Plataforma de carga', dimensions: '10m x 6m', weightTons: 6.3, paintSpecification: 'Anticorrosivo epóxico', totalAmountUF: 430, orderedDaysAgo: 27, promisedInDays: -8, priority: 'URGENTE', stationsCompleted: 6, inProgress: true, profile: 'LATE' },
  { id: 'OT-2026-011', purchaseOrderId: 'OC-2026-011', clientName: 'Puerto Seco Lampa', clientRut: '80.567.890-1', projectName: 'Estructura Techumbre Andén 5', structureType: 'Techumbre metálica', dimensions: '50m x 15m', weightTons: 27.9, paintSpecification: 'Anticorrosivo + esmalte RAL 7016', totalAmountUF: 1610, orderedDaysAgo: 33, promisedInDays: 1, priority: 'ALTA', stationsCompleted: 5, inProgress: true, profile: 'AT_RISK' },
  { id: 'OT-2026-012', purchaseOrderId: 'OC-2026-012', clientName: 'Frigorífico Sur SA', clientRut: '81.678.901-2', projectName: 'Escalera de Emergencia Norte', structureType: 'Escalera metálica', dimensions: '4m x 15m', weightTons: 2.8, paintSpecification: 'Esmalte poliuretano RAL 1023', totalAmountUF: 245, orderedDaysAgo: 5, promisedInDays: 12, priority: 'MEDIA', stationsCompleted: 0, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-013', purchaseOrderId: 'OC-2026-013', clientName: 'Constructora Andes SpA', clientRut: '76.123.456-7', projectName: 'Mezzanine Bodega Central', structureType: 'Mezzanine', dimensions: '20m x 12m x 4m', weightTons: 14.5, paintSpecification: 'Anticorrosivo RAL 5010', totalAmountUF: 890, orderedDaysAgo: 24, promisedInDays: -3, priority: 'ALTA', stationsCompleted: 3, inProgress: false, profile: 'STOPPED' },
  { id: 'OT-2026-014', purchaseOrderId: 'OC-2026-014', clientName: 'Minera El Cobre Ltda.', clientRut: '78.345.678-9', projectName: 'Soporte de Tuberías Planta Norte', structureType: 'Soporte de tuberías', dimensions: '35m lineales', weightTons: 7.1, paintSpecification: 'Galvanizado en caliente', totalAmountUF: 505, orderedDaysAgo: 10, promisedInDays: 9, priority: 'MEDIA', stationsCompleted: 1, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-015', purchaseOrderId: 'OC-2026-015', clientName: 'Puerto Seco Lampa', clientRut: '80.567.890-1', projectName: 'Contenedor Modular Oficina Terreno', structureType: 'Módulo prefabricado', dimensions: '6m x 3m x 2.6m', weightTons: 4.2, paintSpecification: 'Esmalte sintético RAL 9010', totalAmountUF: 380, orderedDaysAgo: 17, promisedInDays: 4, priority: 'BAJA', stationsCompleted: 6, inProgress: true, profile: 'ON_TIME' },
  { id: 'OT-2026-016', purchaseOrderId: 'OC-2026-016', clientName: 'Agroindustrial San Pedro', clientRut: '79.456.789-0', projectName: 'Silo Metálico 350 Ton', structureType: 'Silo', dimensions: 'Ø10m x 14m', weightTons: 24.6, paintSpecification: 'Anticorrosivo epóxico', totalAmountUF: 1540, orderedDaysAgo: 40, promisedInDays: -12, priority: 'URGENTE', stationsCompleted: 6, inProgress: true, profile: 'LATE' },
];

/** Duración real de una estación según el perfil de la OT: qué tan lejos se desvía del estándar. */
function actualHoursFor(standard: number, profile: DelayProfile, isLastEntered: boolean): number {
  switch (profile) {
    case 'ON_TIME':
      return Math.round(standard * (0.9 + Math.random() * 0.15) * 10) / 10;
    case 'AT_RISK':
      return Math.round(standard * (1.1 + Math.random() * 0.25) * 10) / 10;
    case 'LATE':
      return Math.round(standard * (1.4 + Math.random() * 0.4) * 10) / 10;
    case 'STOPPED':
      return isLastEntered ? Math.round(standard * 2.5 * 10) / 10 : Math.round(standard * 1.1 * 10) / 10;
  }
}

function buildHistory(seed: OrderSeed): { history: StationHistoryEntry[]; currentStation: Station } {
  const history: StationHistoryEntry[] = [];
  const stationsToBuild = Math.min(Math.max(seed.stationsCompleted + 1, 1), STATIONS.length);
  let cursorDaysAgo = seed.orderedDaysAgo;

  for (let i = 0; i < stationsToBuild; i++) {
    const station = STATIONS[i];
    const meta = STATION_META[station];
    const isCurrent = i === stationsToBuild - 1;
    const isCompleted = i < seed.stationsCompleted;
    const actualHours = isCompleted || (isCurrent && seed.profile === 'STOPPED')
      ? actualHoursFor(meta.standardHours, seed.profile, isCurrent)
      : null;

    const enteredAt = daysAgo(cursorDaysAgo);
    const exitedAt = isCompleted ? daysAgo(Math.max(cursorDaysAgo - (actualHours ?? meta.standardHours) / 24, 0)) : null;

    history.push({
      station,
      enteredAt,
      exitedAt,
      estimatedHours: meta.standardHours,
      actualHours,
      responsible: RESPONSIBLES[(i + seed.id.length) % RESPONSIBLES.length],
      notes: seed.profile === 'STOPPED' && isCurrent ? 'Detenida: a la espera de insumo crítico.' : undefined,
    });

    cursorDaysAgo = Math.max(cursorDaysAgo - (actualHours ?? meta.standardHours) / 24, 0);
  }

  return { history, currentStation: STATIONS[stationsToBuild - 1] };
}

function deriveStatus(seed: OrderSeed): OrderStatus {
  if (seed.profile === 'STOPPED') return 'DETENIDO';
  if (seed.profile === 'LATE') return 'ATRASADO';
  if (seed.profile === 'AT_RISK') return 'EN_RIESGO';
  return 'EN_TIEMPO';
}

function deriveProgress(seed: OrderSeed, currentStation: Station): number {
  const meta = STATION_META[currentStation];
  const base = (seed.stationsCompleted / STATIONS.length) * 100;
  const partial = seed.inProgress && seed.stationsCompleted < STATIONS.length ? (1 / STATIONS.length) * 40 : 0;
  void meta;
  return Math.min(Math.round(base + partial), 100);
}

function buildWorkOrder(seed: OrderSeed): WorkOrder {
  const { history, currentStation } = buildHistory(seed);
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
    progressPercentage: deriveProgress(seed, currentStation),
    history,
  };
}

export const mockPurchaseOrders: PurchaseOrder[] = SEEDS.map((seed) => ({
  id: seed.purchaseOrderId,
  clientName: seed.clientName,
  clientRut: seed.clientRut,
  issuedDate: daysAgo(seed.orderedDaysAgo + 2),
  totalAmountUF: seed.totalAmountUF,
  status: 'APROBADA',
}));

export const mockOrders: WorkOrder[] = SEEDS.map(buildWorkOrder);
