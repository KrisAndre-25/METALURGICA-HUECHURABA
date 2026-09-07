import { useState } from 'react';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

const WEEKDAYS: Record<LandingLanguage, string[]> = {
  es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
};
const MONTH_LABEL: Record<LandingLanguage, string> = { es: 'Agosto 2026', en: 'August 2026' };
/** Grilla estática de 5 semanas (35 días) — suficiente para el efecto visual, sin lógica de calendario real. */
const DAYS = Array.from({ length: 35 }, (_, i) => i - 2);
const HIGHLIGHTED = new Set([9, 14, 20, 27]);

/** Mini-calendario decorativo — "auditar turnos de producción pasados". No hay estado de negocio real detrás. */
export function CalendarBackground() {
  const { language } = useLandingLanguage();
  const [selected, setSelected] = useState(14);

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pt-4">
      <div className="w-full max-w-[220px] rounded-xl border border-blue-900/40 bg-black/70 p-3">
        <p className="mb-2 text-center text-[11px] font-semibold text-slate-200">{MONTH_LABEL[language]}</p>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS[language].map((d, i) => (
            <span key={i} className="text-center text-[9px] font-medium text-slate-500">
              {d}
            </span>
          ))}
          {DAYS.map((day, i) => {
            const inMonth = day >= 1 && day <= 31;
            const isSelected = inMonth && day === selected;
            const isFlagged = inMonth && HIGHLIGHTED.has(day);
            return (
              <button
                key={i}
                type="button"
                disabled={!inMonth}
                onClick={() => inMonth && setSelected(day)}
                className={`relative flex size-6 items-center justify-center rounded-md text-[10px] transition-colors ${
                  !inMonth
                    ? 'text-transparent'
                    : isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white'
                      : 'text-slate-300 hover:bg-blue-950/50'
                }`}
              >
                {inMonth ? day : '·'}
                {isFlagged && !isSelected && <span className="absolute bottom-0.5 size-1 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
