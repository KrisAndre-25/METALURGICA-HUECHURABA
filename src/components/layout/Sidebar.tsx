import { Factory, LogOut, MessageSquareText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { formatRole } from '../../utils/formatters';
import { cn } from '../ui/cn';
import type { NavTab } from './BottomNavigation';

interface SidebarProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
  onOpenChat: () => void;
}

/**
 * Sidebar ciber-industrial para pantallas de escritorio (`sm` en adelante); en
 * mobile se usa BottomNavigation + un botón flotante de chat (ver ChatFab).
 * Estructura de 3 bloques con altura fija de viewport: header arriba, nav en
 * medio (única zona que crece/scrollea si hay muchos links), footer de
 * perfil+logout siempre pegado abajo.
 *
 * Lenguaje de color deliberado: el VERDE neón marca "dónde estás" (tab activo,
 * estado online) — el ÁMBAR marca "algo requiere tu atención" (mensajes nuevos
 * en el canal). El naranja de marca queda reservado para acciones/CTAs.
 */
export function Sidebar<T extends string>({ tabs, active, onChange, onOpenChat }: SidebarProps<T>) {
  const { user, logout } = useAuth();
  const { messages } = useChat();
  const unreadHint = messages.length > 0;

  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-slate-800 bg-forge-surface sm:flex">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-800 px-5 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-forge-accent/15 shadow-[0_0_12px_rgba(255,107,26,0.25)]">
          <Factory className="size-5 text-forge-accent" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">ForgeFlow</p>
          <p className="truncate text-[11px] leading-tight text-forge-steel">Industrial Control Tower</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <NavItem icon={Icon} label={label} active={active === id} onClick={() => onChange(id)} />
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onOpenChat}
            className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forge-steel transition-colors hover:bg-forge-surface-2 hover:text-slate-100"
          >
            <MessageSquareText className="size-4 shrink-0" />
            <span className="flex-1 truncate text-left">Canal Taller</span>
            {unreadHint && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-forge-warn opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-forge-warn" />
              </span>
            )}
          </button>
        </div>
      </nav>

      {user && (
        <div className="shrink-0 border-t border-slate-800 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-forge-accent/15 text-xs font-bold text-forge-accent">
              {user.name.charAt(0)}
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-forge-surface bg-forge-ok shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="text-[10px] text-forge-steel">{formatRole(user.role)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-forge-steel transition-colors hover:bg-forge-stopped/10 hover:text-forge-stopped"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-forge-ok/10 text-forge-ok' : 'text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-forge-ok shadow-[0_0_8px_rgba(34,197,94,0.9)]"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
