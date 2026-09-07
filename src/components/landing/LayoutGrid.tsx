import { AnimatePresence, motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import { cn } from '../ui/cn';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

export interface LayoutGridCard {
  id: number;
  /** Fondo del thumbnail — un gradiente de marca (no hay fotos/capturas reales que vincular). */
  thumbnail: ReactNode;
  className: string;
  title: string;
  subtitle: string;
  content: ReactNode;
}

function GridCard({ card, onClick }: { card: LayoutGridCard; onClick: () => void }) {
  return (
    <motion.div layoutId={`card-${card.id}`} onClick={onClick} className={cn('relative row-span-1 cursor-pointer', card.className)}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-blue-500/20 transition-colors hover:border-blue-500/50">
        {card.thumbnail}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-16">
          <p className="text-base font-bold text-white">{card.title}</p>
          <p className="text-xs text-slate-300">{card.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Grilla con tarjetas que se expanden a una vista de detalle al hacer clic —
 * estilo Aceternity UI `LayoutGrid`, reimplementado con `layoutId` de Framer
 * Motion (transición compartida) en vez del paquete original.
 */
export function LayoutGrid({ cards }: { cards: LayoutGridCard[] }) {
  const { language } = useLandingLanguage();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = cards.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[16rem]">
        {cards.map((card) => (
          <GridCard key={card.id} card={card} onClick={() => setSelectedId(card.id)} />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`card-${selected.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-500/30 bg-slate-900"
            >
              {/* h-80 (en vez de h-40): con `object-top` sobre fotos cuadradas 1:1, una franja
                  demasiado angosta en un modal ancho recorta la cara hasta dejar solo el cabello. */}
              <div className="relative h-80 w-full overflow-hidden">
                {selected.thumbnail}
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label={language === 'es' ? 'Cerrar' : 'Close'}
                  className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <IconX className="size-4" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-xl font-bold text-white md:text-3xl">{selected.title}</p>
                <p className="mb-2 text-sm font-semibold text-cyan-400 md:text-base">{selected.subtitle}</p>
                <div className="mt-3">{selected.content}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
