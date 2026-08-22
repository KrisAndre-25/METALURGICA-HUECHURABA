import { mockOrders } from '../data/mockOrders';
import { mockPurchaseOrders } from '../data/mockPurchaseOrders';
import { mockUsers } from '../data/mockUsers';
import { STATION_LIST, STATION_META } from '../data/mockStations';
import type { PurchaseOrder, WorkOrder } from '../types/order';
import type { User } from '../types/user';

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
