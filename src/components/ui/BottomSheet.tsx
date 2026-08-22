import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from './cn';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

const DRAG_CLOSE_OFFSET = 120;
const DRAG_CLOSE_VELOCITY = 600;

/**
 * Lámina emergente desde abajo, con gesto de deslice para cerrar (arrastra el
 * handle hacia abajo). Reemplaza al modal centrado tradicional en mobile.
 */
export function BottomSheet({ open, onClose, title, subtitle, children, className }: BottomSheetProps) {
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_OFFSET || info.velocity.y > DRAG_CLOSE_VELOCITY) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              'flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-2xl border-t border-forge-border bg-forge-surface',
              'sm:max-w-md sm:rounded-2xl sm:border',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-2.5">
              <div className="h-1.5 w-10 rounded-full bg-forge-border" />
            </div>
            {title && (
              <div className="shrink-0 border-b border-forge-border px-5 pb-3 pt-1">
                <h2 className="text-base font-semibold">{title}</h2>
                {subtitle && <p className="text-xs text-forge-steel">{subtitle}</p>}
              </div>
            )}
            <div className="overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
