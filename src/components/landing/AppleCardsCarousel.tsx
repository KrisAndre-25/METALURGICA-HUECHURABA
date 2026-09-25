import { AnimatePresence, motion } from 'framer-motion';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface CarouselCardData {
  category: string;
  title: string;
  /** Resumen corto bajo el título, en la portada. */
  summary: string;
  /** Captura mobile de la app (en `/public`), mostrada dentro de un teléfono. */
  src: string;
  /** Contenido del detalle expandido. */
  content: ReactNode;
}

interface CarouselProps {
  items: ReactNode[];
  /** Encabezado de la sección; las flechas se ubican a su derecha. */
  header: ReactNode;
  /** Etiquetas accesibles de las flechas (vienen traducidas desde la landing). */
  prevLabel: string;
  nextLabel: string;
}

/**
 * Carrusel horizontal estilo "Apple Cards" (Aceternity UI), portado a
 * framer-motion + Tabler y a la paleta DMAIX. Scroll nativo con flechas; las
 * flechas se deshabilitan en los extremos.
 */
export function Carousel({ items, header, prevLabel, nextLabel }: CarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scrollBy = (dx: number) => carouselRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  const arrowClass =
    'flex size-10 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900 text-cyan-300 transition-colors ' +
    'hover:bg-cyan-500/15 disabled:opacity-35 disabled:hover:bg-slate-900';

  return (
    <div className="relative w-full">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:flex-row sm:items-end sm:justify-between md:px-8">
        <div className="min-w-0">{header}</div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button type="button" onClick={() => scrollBy(-340)} disabled={!canScrollLeft} aria-label={prevLabel} className={arrowClass}>
            <IconArrowNarrowLeft className="size-6" />
          </button>
          <button type="button" onClick={() => scrollBy(340)} disabled={!canScrollRight} aria-label={nextLabel} className={arrowClass}>
            <IconArrowNarrowRight className="size-6" />
          </button>
        </div>
      </div>

      {/* El padding lateral replica el del contenedor max-w-7xl del título, así la 1.ª tarjeta queda alineada con él. */}
      <div
        ref={carouselRef}
        onScroll={checkScrollability}
        className={
          'flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth pb-4 pt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
          'scroll-px-4 px-4 md:scroll-px-8 md:px-8 xl:scroll-px-[calc((100vw-80rem)/2+2rem)] xl:px-[calc((100vw-80rem)/2+2rem)]'
        }
      >
        <div className="flex w-max gap-4 md:gap-5">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index, ease: 'easeOut' }}
              className="snap-start"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  card: CarouselCardData;
  closeLabel: string;
}

/**
 * Tarjeta del carrusel: portada con la captura y, al tocarla, detalle expandido
 * a pantalla completa. El detalle va por portal a `body`: dentro de las
 * secciones animadas de la landing (con `transform`), un `fixed` quedaría recortado.
 */
export function Card({ card, closeLabel }: CardProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[90] overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-lg"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={card.title}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.98 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative z-[91] mx-auto my-6 h-fit max-w-5xl rounded-3xl border border-cyan-500/20 bg-[#0F172A] p-5 shadow-[0_0_60px_rgba(6,182,212,0.15)] sm:my-10 md:p-10"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={closeLabel}
                  className="sticky right-0 top-4 z-10 ml-auto flex size-9 items-center justify-center rounded-full bg-slate-800 text-slate-200 transition-colors hover:bg-cyan-500 hover:text-slate-950"
                >
                  <IconX className="size-5" />
                </button>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#06B6D4]">{card.category}</p>
                <p className="mt-3 text-2xl font-bold text-white md:text-5xl">{card.title}</p>
                <div className="py-8 md:py-10">{card.content}</div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          'group relative flex h-[26rem] w-[17rem] flex-col overflow-hidden rounded-3xl border border-cyan-500/15 text-left ' +
          'bg-gradient-to-b from-[#132036] to-[#0B1220] transition-colors duration-300 hover:border-cyan-400/40 ' +
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:h-[30rem] md:w-80'
        }
      >
        <div className="relative z-20 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06B6D4]">{card.category}</p>
          <p className="mt-2 text-xl font-bold leading-tight text-balance text-white md:text-2xl">{card.title}</p>
          <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-slate-400">{card.summary}</p>
        </div>

        {/* Resplandor cian detrás del teléfono. */}
        <div className="pointer-events-none absolute -bottom-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-500/25 blur-3xl transition-opacity duration-300 group-hover:opacity-100 md:opacity-70" />

        {/* Teléfono con la captura, asomando desde el borde inferior; sube un poco al hover. */}
        <div className="absolute inset-x-0 bottom-0 top-[44%] z-10 flex justify-center md:top-[40%]">
          <div className="relative h-full w-[66%] translate-y-3 overflow-hidden rounded-t-[26px] border-[5px] border-b-0 border-slate-800 bg-slate-950 shadow-[0_-10px_40px_rgba(6,182,212,0.18)] transition-transform duration-500 ease-out group-hover:translate-y-0">
            <div className="absolute left-1/2 top-1.5 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-black" />
            <img src={card.src} alt="" loading="lazy" className="size-full object-cover object-top" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0B1220] to-transparent" />

        <span
          className="absolute bottom-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-cyan-400/40 bg-[#0F172A]/90 text-cyan-300 shadow-lg backdrop-blur transition-colors group-hover:bg-[#06B6D4] group-hover:text-slate-950"
          aria-hidden
        >
          <IconPlus className="size-5" />
        </span>
      </button>
    </>
  );
}

/** Bloque de detalle: texto con puntos clave + el visual animado de la tarjeta. */
export function CardDetail({ lead, description, points, visual }: { lead: string; description: string; points: string[]; visual: ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
        <p className="text-base leading-relaxed text-slate-300 md:text-lg">
          <span className="font-bold text-white">{lead}</span> {description}
        </p>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-slate-300 md:text-base">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative min-h-72 overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">{visual}</div>
      </div>
    </div>
  );
}
