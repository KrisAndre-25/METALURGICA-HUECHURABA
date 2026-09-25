import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from './cn';

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  /** Ítem activo (controlado por el padre, ej. según la sección visible). */
  activeName: string;
  onSelect?: (name: string) => void;
  /** `layoutId` único por instancia: dos barras montadas a la vez no deben compartir la "lámpara". */
  layoutId?: string;
  /** Desde qué ancho se muestran los nombres (antes, solo íconos). */
  labelsFrom?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LABEL_SHOW = { sm: 'hidden sm:inline', md: 'hidden md:inline', lg: 'hidden lg:inline' } as const;
const ICON_SHOW = { sm: 'sm:hidden', md: 'md:hidden', lg: 'lg:hidden' } as const;

/**
 * Navbar "tubelight" (21st.dev) adaptada a DMAIX: píldora de vidrio con una
 * "lámpara" cian que se desliza (layout animation de framer-motion) hasta el
 * ítem activo. Sin posicionamiento propio: el padre decide dónde va.
 */
export function NavBar({ items, activeName, onSelect, layoutId = 'lamp', labelsFrom = 'md', className }: NavBarProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-full border border-cyan-500/15 bg-slate-900/50 p-1 shadow-lg shadow-black/40 backdrop-blur-lg', className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeName === item.name;
        return (
          <a
            key={item.name}
            href={item.url}
            onClick={() => onSelect?.(item.name)}
            aria-label={item.name}
            aria-current={isActive ? 'location' : undefined}
            className={cn(
              'relative cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:px-3 xl:px-5',
              'text-slate-300/80 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
              isActive && 'bg-slate-800/70 text-cyan-300',
            )}
          >
            <span className={LABEL_SHOW[labelsFrom]}>{item.name}</span>
            <span className={ICON_SHOW[labelsFrom]}>
              <Icon size={18} strokeWidth={2.5} aria-hidden />
            </span>
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 -z-10 w-full rounded-full bg-cyan-400/5"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-cyan-400">
                  <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-cyan-400/20 blur-md" />
                  <div className="absolute -top-1 h-6 w-8 rounded-full bg-cyan-400/20 blur-md" />
                  <div className="absolute left-2 top-0 size-4 rounded-full bg-cyan-400/20 blur-sm" />
                </div>
              </motion.div>
            )}
          </a>
        );
      })}
    </div>
  );
}
