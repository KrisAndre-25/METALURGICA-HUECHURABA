import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send, Tag } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { useOrders } from '../../hooks/useOrders';
import { formatRelativeTime, formatRole } from '../../utils/formatters';
import { cn } from '../ui/cn';
import type { UserRole } from '../../types/user';

const ROLE_DOT: Record<UserRole, string> = {
  ADMIN: 'bg-forge-accent',
  OPERATOR: 'bg-forge-ok',
  CLIENT: 'bg-forge-steel',
};

const ROLE_TEXT: Record<UserRole, string> = {
  ADMIN: 'text-forge-accent',
  OPERATOR: 'text-forge-ok',
  CLIENT: 'text-forge-steel',
};

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useChat();
  const { allOrders } = useOrders();
  const [text, setText] = useState('');
  const [orderId, setOrderId] = useState('');
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text, orderId || undefined);
    setText('');
    setOrderId('');
    setShowOrderPicker(false);
  };

  const subtitle = user?.role === 'CLIENT'
    ? 'Mensajes del taller sobre tus OTs'
    : 'Bitácora compartida — visible para Admin y Operadores';

  return (
    <BottomSheet open={open} onClose={onClose} title="Canal Taller · Bitácora Viva" subtitle={subtitle}>
      <div className="flex h-[60vh] flex-col">
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-10 text-center text-sm text-forge-steel">
              {user?.role === 'CLIENT' ? 'Aún no hay novedades sobre tus OTs.' : 'Sin mensajes todavía — escribe el primero.'}
            </p>
          )}
          {messages.map((m) => {
            const isOwn = m.senderName === user?.name;
            return (
              <div key={m.id} className={cn('flex flex-col gap-1', isOwn && 'items-end')}>
                <div className={cn(
                  'max-w-[85%] rounded-2xl border border-forge-border bg-forge-surface-2 px-3.5 py-2.5',
                  isOwn && 'border-forge-accent/30 bg-forge-accent/10',
                )}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className={cn('size-1.5 rounded-full', ROLE_DOT[m.senderRole])} />
                    <span className="text-xs font-semibold">{m.senderName}</span>
                    <span className={cn('text-[10px] font-medium', ROLE_TEXT[m.senderRole])}>{formatRole(m.senderRole)}</span>
                  </div>
                  <p className="text-sm text-slate-100">{m.text}</p>
                  {m.orderId && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-forge-bg px-2 py-0.5 text-[10px] font-medium text-forge-accent">
                      <Tag className="size-2.5" /> {m.orderId}
                    </span>
                  )}
                </div>
                <span className="px-1 text-[10px] text-forge-steel">{formatRelativeTime(m.timestamp)}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-3 shrink-0 space-y-2 border-t border-forge-border pt-3">
          {showOrderPicker && (
            <select
              aria-label="Seleccionar OT a referenciar"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="h-10 w-full rounded-lg border border-forge-border bg-forge-bg px-3 text-xs text-slate-100 outline-none focus:border-forge-accent"
            >
              <option value="">Sin OT referenciada</option>
              {allOrders.map((o) => (
                <option key={o.id} value={o.id}>{o.id} · {o.projectName}</option>
              ))}
            </select>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setShowOrderPicker((v) => !v)}
              aria-label="Referenciar una OT"
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors',
                showOrderPicker || orderId ? 'border-forge-accent text-forge-accent' : 'border-forge-border text-forge-steel',
              )}
            >
              <Tag className="size-4" />
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje…"
              className="h-11 flex-1 rounded-xl border border-forge-border bg-forge-bg px-3.5 text-sm text-slate-100 outline-none focus:border-forge-accent"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!text.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forge-accent text-white disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}
