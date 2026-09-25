import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, X, ZoomIn } from 'lucide-react';
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
  /** Si viene, el teléfono se puede tocar para verlo ampliado. */
  onZoom?: () => void;
  zoomLabel?: string;
}

function PhoneMockup({ imageName, badgeText, description, highlightArea = 'top', badgePosition, onZoom, zoomLabel }: PhoneMockupProps) {
  return (
    <div className="flex select-none flex-col items-center gap-2">
      <div
        {...(onZoom
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-label': zoomLabel,
              title: zoomLabel,
              onClick: onZoom,
              onKeyDown: (e: { key: string; preventDefault: () => void }) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onZoom();
                }
              },
            }
          : {})}
        className={cn(
          'group relative flex h-[340px] w-[170px] justify-center overflow-hidden rounded-[30px] border-[3px] border-slate-800 bg-slate-900 shadow-2xl',
          onZoom && 'cursor-zoom-in outline-none transition-[border-color,box-shadow] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] focus-visible:border-cyan-400',
        )}
      >
        {onZoom && (
          <span className="absolute bottom-3 right-3 z-40 flex size-7 items-center justify-center rounded-full bg-[#06B6D4] text-slate-950 shadow-lg transition-transform group-hover:scale-110" aria-hidden>
            <ZoomIn className="size-4" />
          </span>
        )}
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

      {description && <p className="max-w-[190px] text-center text-[11px] font-medium leading-tight text-cyan-400 max-sm:hidden">{description}</p>}
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
  // Teléfono ampliado (lightbox) y su factor de zoom según el tamaño de pantalla.
  const [zoomed, setZoomed] = useState<{ mockup: PhoneMockupProps; factor: number } | null>(null);

  const steps = STEPS;
  const total = steps.length;
  const current = steps[Math.min(index, total - 1)];
  const isFirst = index === 0;
  const isLast = index >= total - 1;

  const close = () => {
    markWizardCompleted();
    setIndex(0); // La próxima apertura parte desde el primer paso.
    setZoomed(null);
    onClose();
  };

  const openZoom = (mockup: PhoneMockupProps) => {
    // El teléfono mide 170×340: se agranda hasta ~86% del alto / 92% del ancho, entre 1.4× y 2.6×.
    const factor = Math.max(1.4, Math.min(2.6, (window.innerHeight * 0.86) / 360, (window.innerWidth * 0.92) / 180));
    setZoomed({ mockup, factor });
  };

  const finish = () => {
    close();
    onFinish?.();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Con el teléfono ampliado, Esc solo cierra la vista ampliada y las flechas no cambian de paso.
      if (zoomed) {
        if (e.key === 'Escape') setZoomed(null);
        return;
      }
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
  }, [open, total, onClose, zoomed]);

  if (!current) return null;
  const text = tr.steps[current.key];
  const primaryMockup: PhoneMockupProps = {
    imageName: current.imageName,
    badgeText: text.badge,
    highlightArea: current.highlightArea,
    badgePosition: current.badgePosition,
  };
  const secondaryMockup: PhoneMockupProps | null =
    current.secondary && 'badge2' in text
      ? {
          imageName: current.secondary.imageName,
          badgeText: text.badge2,
          highlightArea: current.secondary.highlightArea,
          badgePosition: current.secondary.badgePosition,
        }
      : null;

  return (
    <>
    <AnimatePresence>
      {open && zoomed && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-modal="true"
          aria-label={tr.zoomIn}
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            aria-label={tr.zoomClose}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-slate-800 text-slate-200 transition-colors hover:bg-[#06B6D4] hover:text-slate-950"
          >
            <X className="size-5" />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            // `zoom` (no `transform: scale`) para que el badge y el texto de la captura se re-rendericen nítidos.
            style={{ zoom: zoomed.factor }}
            onClick={(e) => e.stopPropagation()}
          >
            <PhoneMockup {...zoomed.mockup} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
            className="relative flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-b-0 border-cyan-500/20 bg-[#0F172A] shadow-[0_-12px_50px_rgba(6,182,212,0.12)] sm:max-h-[94svh] sm:rounded-3xl sm:border-b sm:shadow-[0_0_60px_rgba(6,182,212,0.15)]"
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

            <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-slate-700" />
            </div>

            <header className="flex items-center justify-between gap-3 px-4 pt-2 sm:px-7 sm:pt-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/15 text-[#06B6D4] sm:size-8 sm:rounded-xl">
                  <CircleHelp className="size-4 sm:size-[18px]" />
                </span>
                <div>
                  <p className="text-[13px] font-bold leading-tight text-white sm:text-sm">{tr.title}</p>
                  <p className="text-[11px] leading-tight text-slate-400">{tr.step(index + 1, total)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={tr.close}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:size-9"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-7 sm:py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className={cn('grid items-center gap-3 sm:gap-5', current.secondary ? 'sm:gap-6' : 'sm:grid-cols-[auto_1fr] sm:gap-8')}
                >
                  {/* En mobile el teléfono se reduce (zoom mantiene el layout proporcional, a diferencia de scale). */}
                  <div className={cn('flex justify-center gap-3', current.secondary ? 'max-sm:[zoom:0.6]' : 'max-sm:[zoom:0.7]')}>
                    <PhoneMockup {...primaryMockup} description={text.caption} onZoom={() => openZoom(primaryMockup)} zoomLabel={tr.zoomIn} />
                    {secondaryMockup && 'caption2' in text && (
                      <PhoneMockup {...secondaryMockup} description={text.caption2} onZoom={() => openZoom(secondaryMockup)} zoomLabel={tr.zoomIn} />
                    )}
                  </div>
                  <p className="-mt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 sm:hidden">
                    <ZoomIn className="size-3.5" aria-hidden /> {tr.zoomHint}
                  </p>
                  <div className={cn('text-center', !current.secondary && 'sm:text-left')}>
                    <span className="mb-1.5 inline-flex rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-semibold text-[#10B981] sm:mb-2 sm:px-2.5 sm:text-[11px]">
                      {'chip' in text ? text.chip : current.role ? formatRole(current.role, lang) : tr.allRoles}
                    </span>
                    <h2 id="onboarding-title" className="text-base font-bold leading-snug text-white sm:text-xl">{text.title}</h2>
                    <p className="mt-1 text-[13px] leading-snug text-slate-300 sm:mt-2 sm:text-sm sm:leading-relaxed">{text.body}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-slate-800 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-7 sm:py-3.5">
              <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
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

              <div className="flex w-full items-center gap-2 sm:w-auto">
                {!isLast && (
                  <button type="button" onClick={close} className="mr-auto rounded-xl px-2 py-2 text-sm font-medium text-slate-400 hover:text-white sm:mr-0 sm:px-2.5">
                    {tr.skip}
                  </button>
                )}
                {!isFirst && (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i - 1)}
                    aria-label={tr.prev}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-700 px-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-cyan-500/50 sm:h-auto sm:px-3 sm:py-2"
                  >
                    <ChevronLeft className="size-4" /> <span className="hidden sm:inline">{tr.prev}</span>
                  </button>
                )}
                {isLast ? (
                  <button
                    type="button"
                    onClick={finish}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-4 text-sm font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.35)] transition-colors hover:bg-emerald-400 sm:h-auto sm:flex-none sm:py-2"
                  >
                    <CheckCircle2 className="size-4" /> {context === 'landing' ? tr.finishLanding : tr.finish}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i + 1)}
                    className="flex h-10 items-center justify-center gap-1 rounded-xl bg-[#06B6D4] px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 sm:h-auto sm:py-2"
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
    </>
  );
}
