import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from './useOrders';

/**
 * Canal Taller / Bitácora Viva, acotado por rol igual que las OTs: ADMIN y
 * OPERATOR ven todos los mensajes (es su bitácora interna); un CLIENT solo ve
 * los mensajes que referencian una OT propia — nunca charla interna sobre
 * otros clientes, ni mensajes de otra empresa.
 */
export function useChat() {
  const { user } = useAuth();
  const { messages, allOrders, sendMessage: sendMessageRaw } = useOrders();

  const visibleMessages = useMemo(() => {
    if (user?.role !== 'CLIENT') return messages;
    const ownOrderIds = new Set(allOrders.map((o) => o.id));
    return messages.filter((m) => m.orderId && ownOrderIds.has(m.orderId));
  }, [messages, allOrders, user]);

  const sendMessage = (text: string, orderId?: string) => {
    if (!user || !text.trim()) return;
    sendMessageRaw({ senderRole: user.role, senderName: user.name, text, orderId });
  };

  return { messages: visibleMessages, sendMessage };
}
