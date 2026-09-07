import { AnimatePresence, motion } from 'framer-motion';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

interface NavLink {
  label: string;
  href: string;
}

const LINKS: Record<'es' | 'en', NavLink[]> = {
  es: [
    { label: 'Inicio', href: '#hero' },
    { label: 'Piso de Planta', href: '#features' },
    { label: 'Lean Six Sigma', href: '#methodology' },
    { label: 'Torre de Control', href: '#torre-control' },
    { label: 'Equipo & Plataforma', href: '#equipo' },
  ],
  en: [
    { label: 'Home', href: '#hero' },
    { label: 'Shop Floor', href: '#features' },
    { label: 'Lean Six Sigma', href: '#methodology' },
    { label: 'Control Tower', href: '#torre-control' },
    { label: 'Team & Platform', href: '#equipo' },
  ],
};

const TEXT = {
  es: { skip: 'Saltar al contenido principal', login: 'Iniciar Sesión', demo: 'Solicitar Demo', open: 'Abrir menú', close: 'Cerrar menú' },
  en: { skip: 'Skip to main content', login: 'Log In', demo: 'Request Demo', open: 'Open menu', close: 'Close menu' },
};

const SECONDARY_BUTTON_CLASSES =
  'rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-md ' +
  'transition-all hover:border-blue-500/50';

const PRIMARY_BUTTON_CLASSES =
  'transform rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-2 text-sm font-semibold text-white ' +
  'shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]';

interface LandingNavbarProps {
  onLogin: () => void;
}

/**
 * Navbar "resizable" estilo Aceternity: se achica (menos padding, blur más
 * fuerte) al hacer scroll — reimplementada con Framer Motion `useScroll` en
 * vez del paquete `@/components/ui/resizable-navbar` original.
 */
export function LandingNavbar({ onLogin }: LandingNavbarProps) {
  const { language } = useLandingLanguage();
  const links = LINKS[language];
  const t = TEXT[language];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // El scroll real ocurre en el contenedor snap de Home.tsx (padre directo de
  // este <header>), no en `window` — por eso un listener nativo en ese
  // elemento, no `useScroll` de Framer Motion (que asume scroll de ventana).
  useEffect(() => {
    const scrollContainer = headerRef.current?.parentElement;
    if (!scrollContainer) return;
    const handleScroll = () => setScrolled(scrollContainer.scrollTop > 20);
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Skip link: invisible hasta recibir foco por teclado — primer elemento tabulable de la página. */}
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.skip}
      </a>

      <motion.header
        ref={headerRef}
        animate={{ paddingTop: scrolled ? 8 : 14, paddingBottom: scrolled ? 8 : 14 }}
        transition={{ duration: 0.25 }}
        className="sticky top-0 z-50 w-full border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-xl"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Principal">
          <a href="#main-content" className="flex shrink-0 items-center gap-2.5">
            <img src="/icono_software.png" alt="DMAIX Logo" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-lg font-bold text-white">DMAIX</span>
          </a>

          <ul className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="whitespace-nowrap text-sm font-medium text-slate-400 transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button type="button" onClick={onLogin} className={SECONDARY_BUTTON_CLASSES}>
              {t.login}
            </button>
            <a href="#subscribe" className={PRIMARY_BUTTON_CLASSES}>
              {t.demo}
            </a>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? t.close : t.open}
              className="flex size-9 items-center justify-center rounded-lg text-slate-100"
            >
              {mobileOpen ? <IconX className="size-6" /> : <IconMenu2 className="size-6" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="mx-4 mt-3 flex flex-col gap-1 rounded-2xl border border-blue-900/30 bg-slate-950/90 p-3">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-100 hover:bg-blue-950/40"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-blue-900/30 pt-3">
                  <button
                    type="button"
                    onClick={() => { setMobileOpen(false); onLogin(); }}
                    className={`${SECONDARY_BUTTON_CLASSES} text-center`}
                  >
                    {t.login}
                  </button>
                  <a href="#subscribe" onClick={() => setMobileOpen(false)} className={`${PRIMARY_BUTTON_CLASSES} text-center`}>
                    {t.demo}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
