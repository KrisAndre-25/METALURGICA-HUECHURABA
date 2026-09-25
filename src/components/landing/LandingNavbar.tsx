import { IconHelpCircle, IconLogin2, IconRocket } from '@tabler/icons-react';
import { Factory, Home, Route, Target, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';
import { NavBar, type NavItem } from '../ui/tubelight-navbar';
import { cn } from '../ui/cn';

/** Secciones enlazadas; `id` es el ancla y la clave del scroll-spy. */
const SECTIONS = [
  { id: 'hero', icon: Home, es: 'Inicio', en: 'Home' },
  { id: 'features', icon: Factory, es: 'Piso de Planta', en: 'Shop Floor' },
  { id: 'methodology', icon: Target, es: 'Lean Six Sigma', en: 'Lean Six Sigma' },
  { id: 'dmaic', icon: Route, es: 'Pasos DMAIC', en: 'DMAIC Steps' },
  { id: 'equipo', icon: Users, es: 'Equipo', en: 'Team' },
] as const;

const TEXT = {
  es: { skip: 'Saltar al contenido principal', login: 'Iniciar Sesión', loginShort: 'Ingresar', guide: 'Guía de Uso', demo: 'Solicitar Demo', sections: 'Secciones' },
  en: { skip: 'Skip to main content', login: 'Log In', loginShort: 'Log In', guide: 'User Guide', demo: 'Request Demo', sections: 'Sections' },
};

/**
 * Botón pill de Uiverse (el mismo del CTA del hero), a tamaño navbar: blanco,
 * se levanta al hover con una sombra desplazada cian y se hunde al hacer clic.
 */
const PILL_BUTTON_CLASSES =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#0F172A] bg-white font-semibold text-[#0F172A] ' +
  'shadow-[0_0_0_0_#06B6D4] transition-all duration-300 ease-in-out ' +
  'hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-[2px_5px_0_0_#06B6D4] ' +
  'active:translate-x-px active:translate-y-0.5 active:shadow-[0_0_0_0_#06B6D4] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

const GUIDE_BUTTON_CLASSES =
  'flex items-center gap-1.5 rounded-full text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-cyan-300';

interface LandingNavbarProps {
  onLogin: () => void;
  /** Abre la Guía de Uso (OnboardingWizard). */
  onOpenGuide: () => void;
}

/**
 * Navbar flotante de la landing: toda la barra es una cápsula de vidrio
 * ("tubelight") con logo, secciones con lámpara (scroll-spy) y acciones. Bajo
 * `lg` las secciones pasan a una segunda cápsula flotante abajo, solo íconos.
 */
export function LandingNavbar({ onLogin, onOpenGuide }: LandingNavbarProps) {
  const { language } = useLandingLanguage();
  const t = TEXT[language];
  const items: NavItem[] = SECTIONS.map((sec) => ({ name: sec[language], url: `#${sec.id}`, icon: sec.icon }));
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const activeName = SECTIONS.find((sec) => sec.id === activeId)?.[language] ?? items[0].name;
  const selectByName = (name: string) => {
    const sec = SECTIONS.find((item) => item[language] === name);
    if (sec) setActiveId(sec.id);
  };
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

  // Scroll-spy: activa la sección que cruza la franja central de la pantalla.
  // Pasadas las secciones enlazadas (banner, formulario, footer) queda la última.
  useEffect(() => {
    const scrollContainer = headerRef.current?.parentElement;
    if (!scrollContainer || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { root: scrollContainer, rootMargin: '-45% 0px -50% 0px' },
    );
    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
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

      {/*
        `sticky` con alto 0: la cápsula flota sobre el contenido sin empujarlo.
        No usar `fixed`: la landing scrollea en su propio contenedor y un `fixed`
        encadena la rueda del mouse a `window` (ver motion-footer.tsx).
      */}
      <header ref={headerRef} className="pointer-events-none sticky top-0 z-50 h-0 w-full">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <nav
            aria-label="Principal"
            className={cn(
              'pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border p-1.5 pl-3 backdrop-blur-xl transition-all duration-300 sm:pl-4',
              scrolled
                ? 'border-cyan-500/25 bg-slate-950/85 shadow-[0_10px_40px_-12px_rgba(6,182,212,0.4)]'
                : 'border-cyan-500/15 bg-slate-950/55 shadow-lg shadow-black/40',
            )}
          >
            <a href="#main-content" className="flex shrink-0 items-center gap-2 pr-1">
              <img src="/icono_software.png" alt="DMAIX Logo" className="size-8 rounded-full object-cover" />
              <span className="text-base font-bold text-white sm:text-lg">DMAIX</span>
            </a>

            {/* La píldora de secciones va "fundida" dentro de la cápsula (sin su propio borde/fondo). */}
            <NavBar
              items={items}
              activeName={activeName}
              onSelect={selectByName}
              layoutId="lamp-desktop"
              labelsFrom="lg"
              className="hidden border-0 bg-transparent p-0 shadow-none backdrop-blur-none lg:flex"
            />

            <div className="hidden items-center gap-2 lg:flex">
              {/* Solo icono entre lg y xl: con el texto no caben las 5 secciones en ~1024–1280px. */}
              <button type="button" onClick={onOpenGuide} aria-label={t.guide} title={t.guide} className={`${GUIDE_BUTTON_CLASSES} px-2 py-2 xl:px-3`}>
                <IconHelpCircle className="size-5 xl:size-[18px]" stroke={1.8} aria-hidden />
                <span className="hidden xl:inline">{t.guide}</span>
              </button>
              <button type="button" onClick={onLogin} className={`${PILL_BUTTON_CLASSES} px-4 py-2 text-sm`}>
                <IconLogin2 className="size-4" stroke={2} aria-hidden />
                {t.login}
              </button>
              <a href="#subscribe" className={`${PILL_BUTTON_CLASSES} px-4 py-2 text-sm`}>
                <IconRocket className="size-4" stroke={2} aria-hidden />
                {t.demo}
              </a>
            </div>

            <div className="flex items-center gap-1.5 min-[360px]:gap-2 lg:hidden">
              <button type="button" onClick={onOpenGuide} aria-label={t.guide} title={t.guide} className={`${GUIDE_BUTTON_CLASSES} size-9 justify-center`}>
                <IconHelpCircle className="size-[22px]" stroke={1.8} aria-hidden />
              </button>
              <button type="button" onClick={onLogin} aria-label={t.login} className={`${PILL_BUTTON_CLASSES} h-9 px-2.5 text-sm min-[360px]:px-3.5`}>
                <IconLogin2 className="size-[18px]" stroke={2} aria-hidden />
                <span className="hidden min-[360px]:inline">{t.loginShort}</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Bajo `lg`: la misma barra, flotante abajo (solo íconos en teléfono, con nombres desde `sm`). */}
      <nav
        aria-label={t.sections}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <NavBar items={items} activeName={activeName} onSelect={selectByName} layoutId="lamp-mobile" labelsFrom="sm" className="pointer-events-auto" />
      </nav>
    </>
  );
}
