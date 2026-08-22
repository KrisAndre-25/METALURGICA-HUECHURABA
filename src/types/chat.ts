import type { UserRole } from './user';

/**
 * Mensaje del "Canal Taller / Bitácora Viva" — canal compartido entre ADMIN,
 * OPERATOR y CLIENT. `orderId` es opcional: si se referencia una OT, un CLIENT
 * solo puede ver ese mensaje si esa OT es suya (ver `useChat`).
 */
export interface ChatMessage {
  id: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  orderId?: string;
}
