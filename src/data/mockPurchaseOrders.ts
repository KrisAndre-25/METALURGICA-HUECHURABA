import type { PurchaseOrder } from '../types/order';

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS).toISOString();

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'OC-2026-880', clientName: 'Constructora Andes SpA', clientRut: '76.123.456-7', issuedDate: daysAgo(40), totalAmountUF: 1850, status: 'EN_PRODUCCION', assignedVendedor: 'Diego Fuentes' },
  { id: 'OC-2026-881', clientName: 'Inmobiliaria Los Robles', clientRut: '77.234.567-8', issuedDate: daysAgo(22), totalAmountUF: 375, status: 'EN_PRODUCCION', assignedVendedor: 'Valentina Rojas' },
  { id: 'OC-2026-882', clientName: 'Minera El Cobre Ltda.', clientRut: '78.345.678-9', issuedDate: daysAgo(27), totalAmountUF: 1950, status: 'EN_PRODUCCION', assignedVendedor: 'Diego Fuentes' },
  { id: 'OC-2026-883', clientName: 'Agroindustrial San Pedro', clientRut: '79.456.789-0', issuedDate: daysAgo(32), totalAmountUF: 3170, status: 'EN_PRODUCCION', assignedVendedor: 'Valentina Rojas' },
  { id: 'OC-2026-884', clientName: 'Puerto Seco Lampa', clientRut: '80.567.890-1', issuedDate: daysAgo(35), totalAmountUF: 2990, status: 'EN_PRODUCCION', assignedVendedor: 'Diego Fuentes' },
  { id: 'OC-2026-885', clientName: 'Frigorífico Sur SA', clientRut: '81.678.901-2', issuedDate: daysAgo(14), totalAmountUF: 965, status: 'RECIBIDA', assignedVendedor: 'Valentina Rojas' },
  { id: 'OC-2026-886', clientName: 'Transportes Cordillera SA', clientRut: '82.789.012-3', issuedDate: daysAgo(19), totalAmountUF: 615, status: 'EN_PRODUCCION', assignedVendedor: 'Diego Fuentes' },
  { id: 'OC-2026-887', clientName: 'Viña Los Álamos', clientRut: '83.890.123-4', issuedDate: daysAgo(46), totalAmountUF: 890, status: 'COMPLETADA', assignedVendedor: 'Valentina Rojas' },
];
