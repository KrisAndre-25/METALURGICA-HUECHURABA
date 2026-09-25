import { forwardRef, useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from './cn';
import './motionFooter.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// Botón magnético: sigue al cursor con gsap y vuelve con rebote elástico.
// -------------------------------------------------------------------------
export type MagneticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: ElementType;
  };

export const MagneticButton = forwardRef<HTMLElement, MagneticButtonProps>(({ className, children, as: Component = 'button', ...props }, forwardedRef) => {
  const localRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = localRef.current;
    // Sin puntero fino (pantallas táctiles) el efecto no aporta y solo cuesta.
    if (!element || !window.matchMedia('(pointer: fine)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(element, { x: x * 0.4, y: y * 0.4, rotationX: -y * 0.15, rotationY: x * 0.15, scale: 1.05, ease: 'power2.out', duration: 0.4 });
    };
    const handleMouseLeave = () => {
      gsap.to(element, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: 'elastic.out(1, 0.3)', duration: 1.2 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(element);
    };
  }, []);

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </Component>
  );
});
MagneticButton.displayName = 'MagneticButton';

export interface FooterPill {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  external?: boolean;
}

export interface CinematicFooterProps {
  heading: string;
  marquee: string[];
  primary: FooterPill[];
  secondary: FooterPill[];
  copyright: string;
  badge: ReactNode;
  backToTopLabel: string;
  giantText?: string;
  /** Selector del contenedor que hace scroll (la landing no scrollea en `window`). */
  scrollerSelector?: string;
}

function Pill({ pill, className }: { pill: FooterPill; className: string }) {
  if (pill.href) {
    return (
      <MagneticButton
        as="a"
        href={pill.href}
        {...(pill.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cn('footer-glass-pill group flex items-center gap-3 rounded-full', className)}
      >
        {pill.icon}
        {pill.label}
      </MagneticButton>
    );
  }
  return (
    <MagneticButton as="button" type="button" onClick={pill.onClick} className={cn('footer-glass-pill group flex items-center gap-3 rounded-full', className)}>
      {pill.icon}
      {pill.label}
    </MagneticButton>
  );
}

/**
 * Footer "cinemático": aparece como un telón al llegar al final (parallax del
 * footer dentro de un wrapper con overflow oculto), con parallax del texto
 * gigante y revelado del contenido vía ScrollTrigger.
 *
 * Importante: NO usar `position: fixed` para el telón. La landing hace scroll
 * dentro de un contenedor propio (`.snap-y`), y un elemento `fixed` encadena la
 * rueda/touch hacia `window` (su bloque contenedor), no hacia ese contenedor:
 * con el footer ocupando la pantalla, la rueda del mouse dejaba de subir.
 */
export function CinematicFooter({
  heading,
  marquee,
  primary,
  secondary,
  copyright,
  badge,
  backToTopLabel,
  giantText = 'DMAIX',
  scrollerSelector = '.snap-y',
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const scroller = (wrapper.closest(scrollerSelector) as HTMLElement | null) ?? undefined;

    const ctx = gsap.context(() => {
      // Efecto "telón" sin `position: fixed`: el footer parte desplazado hacia arriba y se
      // asienta mientras el wrapper entra, así parece revelarse desde debajo de la página.
      gsap.fromTo(
        footerRef.current,
        { yPercent: -35 },
        { yPercent: 0, ease: 'none', scrollTrigger: { trigger: wrapper, scroller, start: 'top bottom', end: 'bottom bottom', scrub: true } },
      );
      gsap.fromTo(
        giantTextRef.current,
        { y: '10vh', scale: 0.8, opacity: 0 },
        { y: '0vh', scale: 1, opacity: 1, ease: 'power1.out', scrollTrigger: { trigger: wrapper, scroller, start: 'top 80%', end: 'bottom bottom', scrub: 1 } },
      );
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: wrapper, scroller, start: 'top 40%', end: 'bottom bottom', scrub: 1 } },
      );
    }, wrapper);

    return () => ctx.revert();
  }, [scrollerSelector]);

  const scrollToTop = () => {
    const scroller = wrapperRef.current?.closest(scrollerSelector);
    (scroller ?? window).scrollTo({ top: 0, behavior: 'smooth' });
  };

  const marqueeRow = (
    <div className="flex items-center space-x-12 px-6">
      {marquee.map((item, i) => (
        <span key={item} className="flex items-center space-x-12">
          <span>{item}</span>
          <span className={i % 2 === 0 ? 'text-cyan-400/60' : 'text-emerald-400/60'}>✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div ref={wrapperRef} data-pausable className="relative h-screen w-full overflow-hidden">
      <footer ref={footerRef} className="cinematic-footer-wrapper absolute inset-0 flex flex-col justify-between overflow-hidden">
        <div className="footer-aurora animate-footer-breathe pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]" />
        <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

        <div
          ref={giantTextRef}
          aria-hidden
          className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
        >
          {giantText}
        </div>

        {/* Marquee diagonal */}
        <div className="absolute left-0 top-12 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-cyan-500/20 bg-[#050a14]/70 py-4 shadow-2xl backdrop-blur-md">
          <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold uppercase tracking-[0.3em] text-slate-400 md:text-sm" aria-hidden>
            {marqueeRow}
            {marqueeRow}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
          <h2 ref={headingRef} className="footer-text-glow mb-10 text-center text-4xl font-black tracking-tighter sm:text-5xl md:mb-12 md:text-7xl lg:text-8xl">
            {heading}
          </h2>

          <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
            <div className="flex w-full flex-wrap justify-center gap-4">
              {primary.map((pill) => (
                <Pill key={pill.label} pill={pill} className="px-8 py-4 text-sm font-bold text-white md:px-10 md:py-5 md:text-base" />
              ))}
            </div>
            <div className="mt-2 flex w-full flex-wrap justify-center gap-3 md:gap-5">
              {secondary.map((pill) => (
                <Pill key={pill.label} pill={pill} className="px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-white md:px-6 md:py-3 md:text-sm" />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-5 px-6 pb-8 md:flex-row md:px-12">
          <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 md:order-1 md:text-xs">{copyright}</div>
          <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full px-6 py-3 md:order-2">{badge}</div>
          <MagneticButton
            as="button"
            type="button"
            onClick={scrollToTop}
            aria-label={backToTopLabel}
            title={backToTopLabel}
            className="footer-glass-pill group order-3 flex size-12 items-center justify-center rounded-full text-slate-400 hover:text-white"
          >
            <svg className="size-5 transition-transform duration-300 group-hover:-translate-y-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </MagneticButton>
        </div>
      </footer>
    </div>
  );
}
