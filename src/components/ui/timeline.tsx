// Basado en Hyperiux Vault (https://vault.hyperiux.com), adaptado a DMAIX:
// pasos por props (DMAIC) en vez de fechas fijas, scroller propio de la landing
// y ancho de pista calculado para 5 hitos.
import { type CSSProperties, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Reemplazo inline de `useGSAP` (@gsap/react): un gsap.context por vida del
   componente; el callback se vuelve a agregar cuando cambian las dependencias
   y el contexto se revierte solo al desmontar. */
function useGSAP(
  callback: () => void | (() => void),
  options?: { dependencies?: unknown[]; scope?: { current: Element | null } },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    ctxRef.current = gsap.context(() => {}, scope?.current ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === 'function' ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export interface TimelineStep {
  /** Identificador único, válido como clase CSS (ej. "define"). */
  id: string;
  /** Rótulo del hito (ej. "01 · Definir"). */
  heading: string;
  content: string;
  /** Fila donde se dibuja: arriba o abajo de la línea central. */
  position: 'top' | 'bottom';
}

export type TimelineProps = {
  steps: TimelineStep[];
  title: string;
  periodLabel: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl: string;
  imageAlt: string;
  /** Duración de la animación de revelado, en segundos. */
  duration?: number;
  /** Selector del contenedor que hace scroll (la landing no scrollea en `window`). */
  scrollerSelector?: string;
  id?: string;
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

const getReducedMotionSnapshot = () => (typeof window === 'undefined' ? false : (window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false));

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, () => false);
}

const MOBILE_BREAKPOINT = 600;

export default function Timeline({
  steps,
  title,
  periodLabel,
  textColor = '#ffffff',
  mutedTextColor = '#94a3b8',
  activeColor = '#06B6D4',
  backgroundColor = '#000000',
  imageUrl,
  imageAlt,
  duration = 1.2,
  scrollerSelector = '.snap-y',
  id = 'journey',
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);
  const topSteps = steps.filter((s) => s.position === 'top');
  const bottomSteps = steps.filter((s) => s.position === 'bottom');
  const sectionStyle: CSSProperties = { color: textColor, backgroundColor };
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };

  const getScroller = () => (sectionRef.current?.closest(scrollerSelector) as HTMLElement | null) ?? undefined;

  // Desplazamiento horizontal de la pista + línea central que se dibuja.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = wholeSliderRef.current;
      if (!section || !slider) return;
      const scroller = getScroller();
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      gsap.fromTo(
        slider,
        { x: 0 },
        {
          // Se recorre exactamente lo que sobra de la pista, sin fijar porcentajes.
          x: () => -(slider.scrollWidth - section.clientWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            scroller,
            start: 'top top',
            end: isMobile ? '82% 50%' : '92% bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      if (reducedMotion) {
        gsap.set('.journey-line', { width: '98%' });
        return;
      }

      gsap.to('.journey-line', {
        width: '98%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          scroller,
          start: isMobile ? 'top 30%' : 'top 25%',
          end: isMobile ? '80% 50%' : '92% bottom',
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion], scope: sectionRef },
  );

  // Revelado de cada hito: tallo, punto y texto por líneas.
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const scroller = getScroller();

      if (reducedMotion) {
        steps.forEach((step) => {
          gsap.set(`.jl-${step.id}`, { scaleY: 1 });
          gsap.set(`.jd-${step.id}`, { scale: 1 });
        });
        return;
      }

      const splits: SplitText[] = [];
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

      steps.forEach((step, index) => {
        gsap.set(`.jl-${step.id}`, { scaleY: 0, transformOrigin: step.position === 'top' ? 'bottom' : 'top' });
        gsap.set(`.jd-${step.id}`, { scale: 0 });

        const titleSplit = new SplitText(`.title-${step.id}`, { type: 'lines', mask: 'lines' });
        const descriptionSplit = new SplitText(`.description-${step.id}`, { type: 'lines', mask: 'lines' });
        splits.push(titleSplit, descriptionSplit);

        // Ventanas de scroll repartidas en forma pareja entre los hitos.
        const startPos = isMobile ? 22 + index * 10 : 6 + index * 12;
        const endPos = startPos + (isMobile ? 10 : 20);

        gsap
          .timeline({
            scrollTrigger: { trigger: section, scroller, start: `${startPos}% 30%`, end: `${endPos}% 50%`, scrub: true },
          })
          .to(`.jl-${step.id}`, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(`.jd-${step.id}`, { scale: 1, duration: normalizedDuration * 0.4 }, '<')
          .fromTo(
            titleSplit.lines,
            { y: 100 },
            { y: 0, delay: -0.8 * normalizedDuration, duration: normalizedDuration, stagger: 0.02, ease: 'power2.out' },
          )
          .fromTo(descriptionSplit.lines, { y: 100 }, { y: 0, duration: normalizedDuration, stagger: 0.02, ease: 'power2.out' }, '<');
      });

      // Las fuentes/imagen cambian alturas tras la carga: se recalculan los triggers.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('resize', refresh);
      window.addEventListener('load', refresh);
      const raf = requestAnimationFrame(refresh);

      return () => {
        cancelAnimationFrame(raf);
        splits.forEach((split) => split.revert());
        window.removeEventListener('resize', refresh);
        window.removeEventListener('load', refresh);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion, steps], scope: sectionRef },
  );

  // Función (no componente): un componente definido aquí se remontaría en cada render y rompería el SplitText.
  const renderStepText = (step: TimelineStep) => (
    <>
      <h3 className={`title-${step.id} text-[2.5vw] font-bold leading-none max-[600px]:text-[6.4vw]`}>{step.heading}</h3>
      <p className={`description-${step.id} w-[90%] text-[1.35vw] leading-[1.2] max-[600px]:text-[4.4vw]`} style={mutedTextStyle}>
        {step.content}
      </p>
    </>
  );

  return (
    <section ref={sectionRef} id={id} className="relative h-[200vw] w-full max-[600px]:h-[400vh]" style={sectionStyle}>
      {/* `w-full` (no `w-screen`): dentro del scroller, 100vw incluye la barra de scroll y generaría scroll horizontal. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden pt-[10%] max-[600px]:top-[5%]">
        <div
          ref={wholeSliderRef}
          className="flex h-[30vw] w-[210vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[480vw] max-[600px]:px-[7vw]"
        >
          <div className="h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] border border-white/10 max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            <img src={imageUrl} alt={imageAlt} draggable={false} className="h-full w-full object-cover" />
          </div>

          <div className="relative h-full w-full">
            <div className="absolute left-0 top-[49%] flex h-fit w-full items-center">
              <div className="size-[.8vw] shrink-0 rounded-full max-[600px]:size-[2vw]" style={activeStyle} />
              <div className="journey-line h-px w-[0%] rounded-full" style={activeStyle} />
              <div className="size-[.8vw] shrink-0 rounded-full max-[600px]:size-[2vw]" style={activeStyle} />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] shrink-0 pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className="w-[80%] text-[3vw] font-black leading-[0.95] max-[600px]:text-[8.5vw]">{title}</h2>
              </div>

              <div className="flex h-full w-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topSteps.map((step) => (
                  <div key={step.id} className="relative h-full w-[30vw] shrink-0 px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]">
                    <div className="absolute bottom-0 left-0 top-0 h-full w-full">
                      <div className={`jd-${step.id} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full max-[600px]:size-[2.5vw]`} style={activeStyle} />
                      <div className={`jl-${step.id} h-[94%] w-px rounded-full`} style={activeStyle} />
                    </div>
                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">
                      {renderStepText(step)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex h-1/2 w-full items-center justify-start">
              <div className="h-full w-[34%] shrink-0 pt-[2vw] max-[600px]:w-[30%] max-[600px]:pt-[5vw]">
                <p className="text-[1.65vw] font-semibold uppercase leading-none tracking-[0.2em] max-[600px]:text-[4.2vw]" style={{ color: activeColor }}>
                  {periodLabel}
                </p>
              </div>

              <div className="ml-[7vw] flex h-full w-full gap-x-[20vw] max-[600px]:ml-[7vw] max-[600px]:gap-x-[40vw]">
                {bottomSteps.map((step) => (
                  <div key={step.id} className="relative h-full w-[25vw] shrink-0 px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]">
                    <div className="absolute bottom-[-1%] left-0 h-full w-full">
                      <div className={`jl-${step.id} h-[94%] w-px rounded-full max-[600px]:h-full`} style={activeStyle} />
                      <div className={`jd-${step.id} relative aspect-square size-[1vw] -translate-x-1/2 rounded-full max-[600px]:size-[2.5vw]`} style={activeStyle} />
                    </div>
                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">
                      {renderStepText(step)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
