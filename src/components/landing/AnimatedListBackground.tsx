import { AnimatePresence, motion } from 'framer-motion';
import { IconAlertTriangle, IconBolt, IconCircleCheck, IconPackageOff, IconShieldX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

interface Alert {
  id: number;
  icon: typeof IconAlertTriangle;
  tone: 'stopped' | 'warn' | 'ok';
  text: string;
  meta: string;
}

const POOL: Record<LandingLanguage, Omit<Alert, 'id'>[]> = {
  es: [
    { icon: IconBolt, tone: 'stopped', text: 'OT-2137 detenida — Falla de máquina', meta: 'Estación Pintura · hace 2 min' },
    { icon: IconCircleCheck, tone: 'ok', text: 'OT-2140 — Corte completado en regla', meta: 'Estación Corte · hace 5 min' },
    { icon: IconPackageOff, tone: 'warn', text: 'OT-2044 en riesgo — Falta de insumos', meta: 'Estación Corte · hace 8 min' },
    { icon: IconShieldX, tone: 'stopped', text: 'OT-1998 detenida — Control de Calidad', meta: 'Estación Calidad · hace 14 min' },
    { icon: IconAlertTriangle, tone: 'warn', text: 'OT-2050 — Fecha comprometida próxima a vencer', meta: 'Estación Armado · hace 21 min' },
  ],
  en: [
    { icon: IconBolt, tone: 'stopped', text: 'WO-2137 stopped — Machine failure', meta: 'Painting station · 2 min ago' },
    { icon: IconCircleCheck, tone: 'ok', text: 'WO-2140 — Cutting completed on spec', meta: 'Cutting station · 5 min ago' },
    { icon: IconPackageOff, tone: 'warn', text: 'WO-2044 at risk — Missing materials', meta: 'Cutting station · 8 min ago' },
    { icon: IconShieldX, tone: 'stopped', text: 'WO-1998 stopped — Quality control', meta: 'Quality station · 14 min ago' },
    { icon: IconAlertTriangle, tone: 'warn', text: 'WO-2050 — Committed date approaching', meta: 'Assembly station · 21 min ago' },
  ],
};

const TONE_CLASSES: Record<Alert['tone'], string> = {
  stopped: 'border-red-500/30 bg-red-500/10 text-red-400',
  warn: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

/** Lista que inserta una alerta nueva cada pocos segundos, estilo feed en vivo de paradas de planta. */
export function AnimatedListBackground() {
  const { language } = useLandingLanguage();
  const pool = POOL[language];
  const [items, setItems] = useState<Alert[]>([{ id: 0, ...pool[0] }]);

  useEffect(() => {
    setItems([{ id: 0, ...pool[0] }]);
    let n = 1;
    const id = setInterval(() => {
      setItems((prev) => [{ id: n, ...pool[n % pool.length] }, ...prev].slice(0, 4));
      n += 1;
    }, 2200);
    return () => clearInterval(id);
  }, [pool]);

  return (
    <div className="flex h-full flex-col gap-2 overflow-hidden px-5 pt-6">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${TONE_CLASSES[item.tone]}`}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{item.text}</p>
                <p className="text-[10px] text-slate-500">{item.meta}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
