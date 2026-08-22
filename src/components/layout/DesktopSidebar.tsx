import { Factory, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../ui/cn';
import type { NavTab } from './BottomNavigation';

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', OPERATOR: 'Taller/Oficina', CLIENT: 'Cliente' };

interface DesktopSidebarProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
}

/**
 * Sidebar clásico para pantallas de escritorio (`sm` en adelante); en mobile se usa BottomNavigation.
 * Estructura de 3 bloques con altura fija de viewport: header arriba, nav en medio (única zona
 * que crece/scrollea si hay muchos links), footer de perfil+logout siempre pegado abajo.
 */
export function DesktopSidebar<T extends string>({ tabs, active, onChange }: DesktopSidebarProps<T>) {
  const { user, logout } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-forge-border bg-forge-surface sm:flex">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-forge-border px-5 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-forge-accent/15">
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
      </nav>

      {user && (
        <div className="shrink-0 border-t border-forge-border p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-forge-accent/15 text-xs font-bold text-forge-accent">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="text-[10px] text-forge-steel">{ROLE_LABEL[user.role] ?? user.role}</p>
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
        active ? 'bg-forge-accent/15 text-forge-accent' : 'text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-bar"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-forge-accent"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
