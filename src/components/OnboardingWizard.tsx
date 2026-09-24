import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, X } from 'lucide-react';
import { useEffect, useState, type SyntheticEvent } from 'react';
import { useUiPrefs } from '../contexts/UiPrefsContext';
import { STRINGS, type Strings } from '../i18n/strings';
import type { Language } from '../types/language';
import type { UserRole } from '../types/user';
import { formatRole } from '../utils/formatters';
import { cn } from './ui/cn';

/** Clave pedida explícitamente (fuera del namespace `dmaix:`, así "Restablecer demo" no la borra). */
const WIZARD_STORAGE_KEY = 'dmaix_wizard_completed';

/** `true` si el wizard no se ha completado en este navegador. Nunca lanza (storage bloqueado → no molesta). */
export function shouldShowWizard(): boolean {
  try {
    return localStorage.getItem(WIZARD_STORAGE_KEY) !== 'true';
  } catch {
    return false;
  }
}

function markWizardCompleted() {
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, 'true');
  } catch {
    // Sin storage, la guía volverá a abrirse en la próxima carga.
  }
}

type HighlightArea = 'top' | 'center' | 'bottom';
type StepKey = keyof Strings['onboarding']['steps'];

interface WizardStep {
  key: StepKey;
  /** Nombre del archivo en `/public` (con o sin extensión — ver `PhoneMockup`). */
  imageName: string;
  highlightArea: HighlightArea;
  /** Rol al que aplica la pantalla (chip del paso); sin rol = aplica a todos. */
  role?: UserRole;
  /** Posición a medida del badge cuando la de `highlightArea` taparía lo que se señala. */
  badgePosition?: string;
  /** Segundo mockup lado a lado (usa `badge2`/`caption2` de los textos del paso). */
  secondary?: { imageName: string; highlightArea: HighlightArea; badgePosition?: string };
}

/**
 * Guía completa, en el orden en que viaja una OT por la plataforma: ingreso →
 * venta (Vendedor) → aprobación y control (Admin) → producción (Operador) →
 * seguimiento y despacho (Cliente). Capturas mobile reales en `/public`.
 */
const STEPS: WizardStep[] = [
  // Debajo del botón "Ingresar" de la captura (en `top` el badge lo taparía).
  { key: 'login', imageName: 'home_app.jpeg', highlightArea: 'top', badgePosition: 'top-[42px] right-5' },
  { key: 'salesRequest', imageName: 'solicitud_venta.jpeg', highlightArea: 'center', role: 'VENDEDOR' },
  { key: 'salesStatus', imageName: 'venta_registrada.jpeg', highlightArea: 'center', role: 'VENDEDOR' },
  { key: 'requests', imageName: 'aprobacion_admin.jpeg', highlightArea: 'center', role: 'ADMIN' },
  { key: 'controlTower', imageName: 'torre_de_control_app.jpeg', highlightArea: 'center', role: 'ADMIN' },
  { key: 'operatorHome', imageName: 'operador_planta.jpeg', highlightArea: 'center', role: 'OPERATOR' },
  { key: 'checklist', imageName: 'produccion_OT.jpeg', highlightArea: 'center', role: 'OPERATOR' },
  { key: 'clientHome', imageName: 'despacho_pedidos.jpeg', highlightArea: 'center', role: 'CLIENT' },
  { key: 'clientDispatch', imageName: 'despacho_cliente_portal.jpeg', highlightArea: 'center', role: 'CLIENT' },
  // Badges bajo cada toggle del header (en `top` quedarían encima de los switches).
  {
    key: 'accessibility',
    imageName: 'accesibilidad_contraste.jpeg',
    highlightArea: 'top',
    badgePosition: 'top-[44px] right-[50px]',
    secondary: { imageName: 'accesibilidad_idioma.jpeg', highlightArea: 'top', badgePosition: 'top-[44px] right-6' },
  },
  { key: 'help', imageName: 'torre_de_control_app.jpeg', highlightArea: 'top' },
];

const FALLBACK_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

/**
 * Carga resiliente: prueba `/${imageName}` tal cual y, si falla, las variantes
 * `.png` → `.jpg` → `.jpeg` (sobre el nombre sin extensión). Se detiene al agotarlas.
 */
function handleImageError(e: SyntheticEvent<HTMLImageElement>, imageName: string) {
  const img = e.currentTarget;
  const base = imageName.replace(/\.(png|jpe?g|webp)$/i, '');
  const tried = Number(img.dataset.fallback ?? '0');
  if (tried >= FALLBACK_EXTENSIONS.length) return;
  img.dataset.fallback = String(tried + 1);
  img.src = `/${base}${FALLBACK_EXTENSIONS[tried]}`;
}

const BADGE_POSITION: Record<HighlightArea, string> = {
  top: 'top-7 right-2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-6 left-2',
};

interface PhoneMockupProps {
  imageName: string;
  badgeText?: string;
  description?: string;
  highlightArea?: HighlightArea;
  /** Clases de posición que reemplazan a las de `highlightArea`. */
  badgePosition?: string;
}

function PhoneMockup({ imageName, badgeText, description, highlightArea = 'top', badgePosition }: PhoneMockupProps) {
  return (
    <div className="flex select-none flex-col items-center gap-2">
      <div className="group relative flex h-[340px] w-[170px] justify-center overflow-hidden rounded-[30px] border-[3px] border-slate-800 bg-slate-900 shadow-2xl">
        <div className="pointer-events-none absolute inset-0 z-20 rounded-[28px] border border-white/10" />

        <div className="relative h-full w-full bg-slate-950">
          {/* Status Bar */}
          <div className="absolute left-0 right-0 top-0 z-30 flex w-full items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-3 pt-1 text-[7px] font-medium text-white">
            <span>09:41</span>
            <div className="flex items-center gap-1">
              <span className="text-[7px]">5G</span>
            </div>
          </div>

          {/* Imagen dinámica desde /public/ — `key` reinicia el contador de fallbacks al cambiar de paso. */}
          <div className="relative h-full w-full pt-5">
            <img
              key={imageName}
              src={`/${imageName}`}
              alt={badgeText ?? ''}
              className="h-full w-full rounded-b-[22px] object-cover object-top"
              onError={(e) => handleImageError(e, imageName)}
            />
            <div className="pointer-events-none absolute inset-0 bg-slate-950/10" />

            {/* Badge Interactivo de Instrucción */}
            {badgeText && (
              <div className={cn('absolute z-30 flex items-center gap-1', badgePosition ?? BADGE_POSITION[highlightArea])}>
                <span className="animate-pulse whitespace-nowrap rounded-full bg-cyan-500 px-2 py-0.5 text-[8px] font-bold text-slate-950 shadow-lg">
                  {badgeText}
                </span>
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-1 left-1/2 z-30 h-[2.5px] w-[35%] -translate-x-1/2 rounded-full bg-white/60" />
        </div>

        {/* Island / Notch */}
        <div className="absolute top-[6px] z-30 flex h-3.5 w-12 items-center justify-center rounded-full border border-white/5 bg-black" />
      </div>

      {description && <p className="max-w-[190px] text-center text-[11px] font-medium leading-tight text-cyan-400">{description}</p>}
    </div>
  );
}

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  /**
   * `app` (por defecto): dentro del Dashboard, el botón final solo cierra.
   * `landing`: en la página pública, el botón final lleva al login (`onFinish`).
   */
  context?: 'app' | 'landing';
  /** Se llama tras "¡Entendido…!" (en la landing: abrir el login). */
  onFinish?: () => void;
  /** Idioma forzado: la landing tiene su propio selector (LandingLanguageContext). */
  language?: Language;
}

/**
 * Guía de Uso: se monta en la landing (Home) y en el Dashboard, cada uno con su
 * botón de ayuda en la barra superior. Comparten `dmaix_wizard_completed`:
 * completarla en cualquiera de los dos deja de abrirla sola en ambos.
 * "Omitir", la X, Esc y "¡Entendido…!" la marcan como completada.
 */
export function OnboardingWizard({ open, onClose, context = 'app', onFinish, language }: OnboardingWizardProps) {
  const uiPrefs = useUiPrefs();
  const lang = language ?? uiPrefs.language;
  const tr = (language ? STRINGS[language] : uiPrefs.t).onboarding;
  const [index, setIndex] = useState(0);

  const steps = STEPS;
  const total = steps.length;
  const current = steps[Math.min(index, total - 1)];
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  const close = () => {
    markWizardCompleted();
    setIndex(0); // La próxima apertura parte desde el primer paso.
    onClose();
  };

  const finish = () => {
    close();
    onFinish?.();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markWizardCompleted();
        setIndex(0);
        onClose();
      }
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, total - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, total, onClose]);

  if (!current) return null;
  const text = tr.steps[current.key];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="relative flex max-h-[94svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-cyan-500/20 bg-[#0F172A] shadow-[0_0_60px_rgba(6,182,212,0.15)] sm:rounded-3xl"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-[#06B6D4] to-[#10B981]"
                animate={{ width: `${((index + 1) / total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <header className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/15 text-[#06B6D4]">
                  <CircleHelp className="size-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{tr.title}</p>
                  <p className="text-[11px] text-slate-400">{tr.step(index + 1, total)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={tr.close}
                className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className={cn('grid items-center gap-5', current.secondary ? 'sm:gap-6' : 'sm:grid-cols-[auto_1fr] sm:gap-8')}
                >
                  {/* Con dos mockups (2 × 170px) se reducen en pantallas angostas para que quepan lado a lado. */}
                  <div className={cn('flex justify-center gap-3', current.secondary && 'max-sm:[zoom:0.84]')}>
                    <PhoneMockup
                      imageName={current.imageName}
                      badgeText={text.badge}
                      description={text.caption}
                      highlightArea={current.highlightArea}
                      badgePosition={current.badgePosition}
                    />
                    {current.secondary && 'badge2' in text && (
                      <PhoneMockup
                        imageName={current.secondary.imageName}
                        badgeText={text.badge2}
                        description={text.caption2}
                        highlightArea={current.secondary.highlightArea}
                        badgePosition={current.secondary.badgePosition}
                      />
                    )}
                  </div>
                  <div className={cn('text-center', !current.secondary && 'sm:text-left')}>
                    <span className="mb-2 inline-flex rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981]">
                      {'chip' in text ? text.chip : current.role ? formatRole(current.role, lang) : tr.allRoles}
                    </span>
                    <h2 id="onboarding-title" className="text-lg font-bold text-white sm:text-xl">{text.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{text.body}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-slate-800 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-7">
              <div className="flex items-center gap-1.5" aria-hidden>
                {steps.map((s, i) => (
                  <button
                    key={`${s.key}-${i}`}
                    type="button"
                    tabIndex={-1}
                    onClick={() => setIndex(i)}
                    className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-[#06B6D4]' : 'w-1.5 bg-slate-600 hover:bg-slate-500')}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!isLast && (
                  <button type="button" onClick={close} className="rounded-xl px-2.5 py-2 text-sm font-medium text-slate-400 hover:text-white">
                    {tr.skip}
                  </button>
                )}
                {!isFirst && (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i - 1)}
                    className="flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/50"
                  >
                    <ChevronLeft className="size-4" /> {tr.prev}
                  </button>
                )}
                {isLast ? (
                  <button
                    type="button"
                    onClick={finish}
                    className="flex items-center gap-1.5 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-400"
                  >
                    <CheckCircle2 className="size-4" /> {context === 'landing' ? tr.finishLanding : tr.finish}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i + 1)}
                    className="flex items-center gap-1 rounded-xl bg-[#06B6D4] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                  >
                    {tr.next} <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
