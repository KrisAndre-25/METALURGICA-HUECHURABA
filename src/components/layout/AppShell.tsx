import type { ReactNode } from 'react';
import { Sidebar, type View } from './Sidebar';
import { Header } from './Header';

const TITLES: Record<View, string> = {
  dashboard: 'Dashboard de Producción',
  orders: 'Órdenes de Fabricación',
  checklist: 'Checklist por Estación',
};

export function AppShell({
  active,
  onNavigate,
  children,
}: {
  active: View;
  onNavigate: (view: View) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-forge-bg">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={TITLES[active]} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
