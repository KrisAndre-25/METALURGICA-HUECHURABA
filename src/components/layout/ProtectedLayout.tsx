import { useState, type ReactNode } from 'react';
import { MessageSquareText } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { BottomNavigation, type NavTab } from './BottomNavigation';
import { Sidebar } from './Sidebar';
import { ChatPanel } from '../chat/ChatPanel';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';

interface ProtectedLayoutProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
  title: string;
  children: ReactNode;
}

/**
 * Chrome de la app para usuarios autenticados: en mobile, header superior +
 * bottom navigation nativa + botón flotante del Canal Taller; en desktop
 * (`sm+`), sidebar lateral clásico con el mismo canal accesible desde ahí.
 * El gate de autenticación en sí vive en App.tsx.
 */
export function ProtectedLayout<T extends string>({ tabs, active, onChange, title, children }: ProtectedLayoutProps<T>) {
  const [chatOpen, setChatOpen] = useState(false);
  const { messages } = useChat();
  const { user } = useAuth();
  const { t } = useUiPrefs();
  // Privacidad del portal Cliente: sin acceso al Canal Taller (proceso interno
  // de Admin/Operador/Vendedor) — ni botón flotante, ni panel montado.
  const showChat = user?.role !== 'CLIENT';

  return (
    <div className="flex min-h-svh bg-forge-bg">
      <Sidebar tabs={tabs} active={active} onChange={onChange} onOpenChat={() => setChatOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader title={title} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
      </div>
      <BottomNavigation tabs={tabs} active={active} onChange={onChange} />

      {showChat && (
        <>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            aria-label={t.protectedLayout.openChannel}
            className="fixed bottom-24 right-4 z-40 flex size-13 items-center justify-center rounded-full bg-forge-accent text-white shadow-lg shadow-black/40 transition-transform active:scale-95 sm:hidden"
          >
            <MessageSquareText className="size-5" />
            {messages.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-forge-warn opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full border-2 border-forge-bg bg-forge-warn" />
              </span>
            )}
          </button>

          <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
        </>
      )}
    </div>
  );
}
