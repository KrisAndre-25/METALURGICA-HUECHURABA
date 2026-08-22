import { mockOrders } from '../data/mockOrders';
import { mockPurchaseOrders } from '../data/mockPurchaseOrders';
import { mockUsers } from '../data/mockUsers';
import { STATION_LIST, STATION_META } from '../data/mockStations';
import type { PurchaseOrder, WorkOrder } from '../types/order';
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
