import { Factory, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../ui/cn';
import type { NavTab } from './BottomNavigation';

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', OPERATOR: 'Taller/Oficina', CLIENT: 'Cliente' };

interface DesktopSidebarProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
}

/** Sidebar clásico para pantallas de escritorio (`sm` en adelante); en mobile se usa BottomNavigation. */
export function DesktopSidebar<T extends string>({ tabs, active, onChange }: DesktopSidebarProps<T>) {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-forge-border bg-forge-surface sm:flex">
      <div className="flex items-center gap-2 border-b border-forge-border px-5 py-5">
        <Factory className="size-6 text-forge-accent" />
        <div>
          <p className="text-sm font-bold leading-tight">ForgeFlow</p>
          <p className="text-[11px] leading-tight text-forge-steel">Industrial Control Tower</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <NavItem key={id} icon={Icon} label={label} active={active === id} onClick={() => onChange(id)} />
        ))}
      </nav>

      {user && (
        <div className="border-t border-forge-border p-3">
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
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-forge-steel transition-colors hover:bg-forge-surface-2 hover:text-slate-100"
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
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-forge-accent/15 text-forge-accent' : 'text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
