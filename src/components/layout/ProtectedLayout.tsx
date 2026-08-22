import type { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { BottomNavigation, type NavTab } from './BottomNavigation';
import { DesktopSidebar } from './DesktopSidebar';

interface ProtectedLayoutProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
  title: string;
  children: ReactNode;
}

/**
 * Chrome de la app para usuarios autenticados: en mobile, header superior +
 * bottom navigation nativa; en desktop (`sm+`), sidebar lateral clásico.
 * El gate de autenticación en sí vive en App.tsx.
 */
export function ProtectedLayout<T extends string>({ tabs, active, onChange, title, children }: ProtectedLayoutProps<T>) {
  return (
    <div className="flex min-h-svh bg-forge-bg">
      <DesktopSidebar tabs={tabs} active={active} onChange={onChange} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader title={title} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-6">{children}</main>
      </div>
      <BottomNavigation tabs={tabs} active={active} onChange={onChange} />
    </div>
  );
}
