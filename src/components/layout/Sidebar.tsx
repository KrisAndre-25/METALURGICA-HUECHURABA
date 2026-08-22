import { ClipboardList, Factory, LayoutDashboard } from 'lucide-react';
import { cn } from '../ui/cn';

export type View = 'dashboard' | 'orders' | 'checklist';

const NAV_ITEMS: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { view: 'orders', label: 'Órdenes', icon: ClipboardList },
  { view: 'checklist', label: 'Checklist', icon: Factory },
];

export function Sidebar({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-forge-border bg-forge-surface">
      <div className="flex items-center gap-2 border-b border-forge-border px-5 py-5">
        <Factory className="size-6 text-forge-accent" />
        <div>
          <p className="text-sm font-bold leading-tight">ForgeFlow</p>
          <p className="text-[11px] leading-tight text-forge-steel">Metalúrgica Huechuraba</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            type="button"
            onClick={() => onNavigate(view)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active === view
                ? 'bg-forge-accent/15 text-forge-accent'
                : 'text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
