import { mockOrders } from '../data/mockOrders';
import { mockPurchaseOrders } from '../data/mockPurchaseOrders';
import { mockUsers } from '../data/mockUsers';
import { STATION_LIST, STATION_META } from '../data/mockStations';
import type { PurchaseOrder, SalesRequest, WorkOrder } from '../types/order';
import type { User } from '../types/user';
import type { ChatMessage } from '../types/chat';

const DAY_MS = 24 * 60 * 60 * 1000;

const seedMessages: ChatMessage[] = [
  {
    id: 'msg-seed-1',
    senderRole: 'OPERATOR',
    senderName: 'Juan Carlos Soto',
    text: 'OT-1042 lista para pintura, la dejo pasando por control visual antes de mandarla.',
    timestamp: new Date(Date.now() - DAY_MS).toISOString(),
    orderId: 'OT-1042',
  },
  {
    id: 'msg-seed-2',
    senderRole: 'ADMIN',
    senderName: 'Sergio Núñez',
    text: 'Perfecto, avísenme cuando salga de control de calidad para coordinar el despacho.',
    timestamp: new Date(Date.now() - DAY_MS + 30 * 60 * 1000).toISOString(),
    orderId: 'OT-1042',
  },
];

const HOUR_MS = 60 * 60 * 1000;

/** Solicitudes de Venta pendientes de revisión, para que la vista de Administración no parta vacía. */
const seedSalesRequests: SalesRequest[] = [
  {
    id: 'SV-2026-031',
    clientName: 'Constructora Andes SpA',
    clientRut: '76.123.456-7',
    projectName: 'Mezzanine Bodega Central',
    description: 'Estructura de mezzanine 18m x 10m con escalera y baranda perimetral. Cliente pide terminación galvanizada.',
    estimatedAmountUF: 1850,
    priority: 'ALTA',
    requestedBy: 'Diego Fuentes',
    requestedAt: new Date(Date.now() - 5 * HOUR_MS).toISOString(),
    status: 'PENDIENTE',
  },
  {
    id: 'SV-2026-032',
    clientName: 'Minera El Cobre Ltda.',
    clientRut: '78.345.678-9',
    projectName: 'Pasarelas Planta Chancado',
    description: 'Tres pasarelas de inspección con parrilla antideslizante, 24m lineales en total. Faena con acceso restringido.',
    estimatedAmountUF: 3200,
    priority: 'URGENTE',
    requestedBy: 'Valentina Rojas',
    requestedAt: new Date(Date.now() - 26 * HOUR_MS).toISOString(),
    status: 'PENDIENTE',
  },
  {
    id: 'SV-2026-033',
    clientName: 'Inmobiliaria Los Robles',
    clientRut: '77.234.567-8',
    projectName: 'Cobertizo Estacionamientos',
    description: 'Cobertizo metálico para 20 estacionamientos, cubierta de zinc-alum. Plazo flexible.',
    estimatedAmountUF: 640,
    priority: 'NORMAL',
    requestedBy: 'Diego Fuentes',
    requestedAt: new Date(Date.now() - 50 * HOUR_MS).toISOString(),
    status: 'PENDIENTE',
  },
];

/**
 * Única puerta de entrada a los datos semilla de la app. Los contexts NO deben
 * importar `data/mock*.ts` directamente — todo pasa por aquí, para que exista
 * un solo lugar que sepa "de dónde viene el estado inicial" (hoy: arrays en
 * memoria; el día que haya backend, solo este archivo cambia).
 */
export const mockDataService = {
  getInitialOrders(): WorkOrder[] {
    return mockOrders;
  },
  getInitialPurchaseOrders(): PurchaseOrder[] {
    return mockPurchaseOrders;
  },
  getInitialMessages(): ChatMessage[] {
    return seedMessages;
  },
  getInitialSalesRequests(): SalesRequest[] {
    return seedSalesRequests;
  },
  getUsers(): User[] {
    return mockUsers;
  },
  getStations() {
    return STATION_LIST;
  },
  getStationMeta() {
    return STATION_META;
  },
  /** Lista de clientes derivada de las OC: nombre + RUT, sin duplicados. */
  getClients(): { clientName: string; clientRut: string }[] {
    const seen = new Map<string, string>();
    for (const oc of mockPurchaseOrders) {
      if (!seen.has(oc.clientName)) seen.set(oc.clientName, oc.clientRut);
    }
    return Array.from(seen.entries()).map(([clientName, clientRut]) => ({ clientName, clientRut }));
  },
};
