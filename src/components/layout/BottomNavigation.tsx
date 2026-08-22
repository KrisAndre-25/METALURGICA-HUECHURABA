import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/cn';

export interface NavTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface BottomNavigationProps<T extends string> {
  tabs: NavTab<T>[];
  active: T;
  onChange: (tab: T) => void;
}

/** Barra de navegación inferior estilo app nativa; visible solo en mobile (oculta desde `sm`). */
export function BottomNavigation<T extends string>({ tabs, active, onChange }: BottomNavigationProps<T>) {
  return (
    <nav data-testid="bottom-nav" className="fixed inset-x-0 bottom-0 z-40 border-t border-forge-border bg-forge-surface/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-forge-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn('size-5', isActive ? 'text-forge-accent' : 'text-forge-steel')} />
              <span className={isActive ? 'text-forge-accent' : 'text-forge-steel'}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
