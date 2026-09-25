import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { IconRocket } from '@tabler/icons-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { KristopherCard, YojanCard } from '../components/landing/TeamCards';
import { FlipWords } from '../components/landing/FlipWords';
import { Carousel, Card, CardDetail } from '../components/landing/AppleCardsCarousel';
import { MarqueeBackground } from '../components/landing/MarqueeBackground';
import { AnimatedListBackground } from '../components/landing/AnimatedListBackground';
import { AnimatedBeamBackground } from '../components/landing/AnimatedBeamBackground';
import { CalendarBackground } from '../components/landing/CalendarBackground';
import { Marquee3DSection } from '../components/landing/Marquee3DSection';
import Timeline, { type TimelineStep } from '../components/ui/timeline';
import { ErrorPattern } from '../components/landing/ErrorPattern';
import { SquigglyText } from '../components/landing/SquigglyText';
import { SignupFormDemo } from '../components/landing/SignupFormDemo';
import { LandingFooter } from '../components/landing/LandingFooter';
import { OnboardingWizard, shouldShowWizard } from '../components/OnboardingWizard';
import { LandingLanguageProvider, useLandingLanguage, type LandingLanguage } from '../contexts/LandingLanguageContext';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

/** CTA del hero: botón pill de Uiverse; la sombra desplazada es cian (negra no se vería sobre el fondo oscuro). */
const PRIMARY_CTA_CLASSES =
  'flex items-center gap-2 rounded-full border border-[#0F172A] bg-white px-8 py-4 text-[17px] font-semibold text-[#0F172A] ' +
  'shadow-[0_0_0_0_#06B6D4] transition-all duration-300 ease-in-out ' +
  'hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-[2px_5px_0_0_#06B6D4] ' +
  'active:translate-x-px active:translate-y-0.5 active:shadow-[0_0_0_0_#06B6D4] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

interface Content {
  hero: { words: string[]; pre: string; post: string; subtitle: string; ctaPrimary: string };
  features: {
    heading: string;
    subtitle: string;
    prev: string;
    next: string;
    close: string;
    cards: { category: string; title: string; description: string; lead: string; points: string[] }[];
  };
  methodology: { heading: string; subtitle: string };
  dmaic: { title: string; periodLabel: string; imageAlt: string; steps: TimelineStep[] };
  team: {
    heading: string;
    subtitle: string;
    stats: { value: string; label: string }[];
    kristopherRole: string;
    kristopherSpecialty: string;
    kristopherBio: string;
    kristopherGithub: string;
    kristopherLinkedin: string;
    yojanRole: string;
    yojanSpecialty: string;
    yojanBio: string;
    yojanLinkedin: string;
  };
  banner: { badge: string; pre: string; lossWord: string; mid: string; dmaixWord: string; tagline: string };
}

const CONTENT: Record<LandingLanguage, Content> = {
  es: {
    hero: {
      words: ['Optimiza', 'Automatiza', 'Acelera', 'Digitaliza'],
      pre: 'Controla y ',
      post: 'tu producción metalúrgica en tiempo real',
      subtitle:
        'Elimina la ceguera operativa en planta. DMAIX transforma tus Órdenes de Trabajo (OT) en métricas de alto rendimiento basadas en la metodología DMAIC.',
      ctaPrimary: 'Solicitar Demo Industrial',
    },
    features: {
      heading: 'Diseñado para el piso de planta, no para la oficina',
      subtitle: 'Cada decisión de producto responde a un problema real de trazabilidad industrial.',
      prev: 'Anterior',
      next: 'Siguiente',
      close: 'Cerrar',
      cards: [
        {
          category: 'Trazabilidad',
          title: 'Trazabilidad de Archivos OT',
          description: 'Cada plano, certificado y hoja de corte queda vinculado a su Orden de Trabajo, siempre a un clic.',
          lead: 'Nada se pierde entre estaciones.',
          points: [
            'Planos, hojas de corte y certificados adjuntos a cada OT.',
            'Historial completo: quién movió la OT, cuándo y en qué estación.',
            'Ficha de Conformidad en PDF lista para el cliente al despachar.',
          ],
        },
        {
          category: 'Alertas en vivo',
          title: 'Alertas de Parada en Caliente',
          description: 'Fallas de máquina, falta de insumos o control de calidad: notificadas al instante, sin esperar el reporte de turno.',
          lead: 'Cada minuto detenido cuesta.',
          points: [
            'Motivos de parada estructurados para el análisis de causa raíz.',
            'La Torre de Control marca las OTs detenidas y en riesgo en tiempo real.',
            'Informes de paradas exportables a Excel o CSV.',
          ],
        },
        {
          category: 'Integración',
          title: 'Integración de Datos',
          description: 'Sensores PLC y ERP conversan con la Torre de Control DMAIX en un solo flujo de datos.',
          lead: 'Un solo flujo de datos para toda la planta.',
          points: [
            'Ventas, producción y despacho conectados en la misma plataforma.',
            'Cada avance del checklist actualiza los KPIs de la Torre al instante.',
            'Base lista para conectar sensores PLC y el ERP de la empresa.',
          ],
        },
        {
          category: 'Planificación',
          title: 'Planificación e Histórico',
          description: 'Audita turnos de producción pasados y planifica los próximos desde un mismo calendario.',
          lead: 'El pasado explica el próximo turno.',
          points: [
            'Fechas comprometidas y lead time por estación a la vista.',
            'Estudio de tiempos: capacidad disponible vs. horas reales trabajadas.',
            'El cliente sigue su pedido por etapas hasta la entrega.',
          ],
        },
      ],
    },
    methodology: {
      heading: 'Fundamentos Lean, Six Sigma & Kanban',
      subtitle: 'DMAIX no es un dashboard genérico: está construido sobre metodología industrial probada.',
    },
    dmaic: {
      title: 'Los 5 pasos DMAIC',
      periodLabel: 'Lean Six Sigma',
      imageAlt: 'Soldador trabajando en una planta metalúrgica',
      steps: [
        { id: 'define', heading: '01 Definir', content: 'Delimita el problema, el alcance y lo que tu cliente considera calidad.', position: 'top' },
        { id: 'measure', heading: '02 Medir', content: 'Registra tiempos reales por estación y detecta dónde se pierde capacidad.', position: 'bottom' },
        { id: 'analyze', heading: '03 Analizar', content: 'Encuentra la causa raíz de cada parada con datos, no con suposiciones.', position: 'top' },
        { id: 'improve', heading: '04 Mejorar', content: 'Balancea la línea y aplica acciones correctivas donde más impactan.', position: 'bottom' },
        { id: 'control', heading: '05 Controlar', content: 'Sostén la mejora con KPIs en vivo y alertas en la Torre de Control.', position: 'top' },
      ],
    },
    team: {
      heading: '¿Quién construye esto?',
      subtitle: 'Un equipo latinoamericano con experiencia real en planta, detrás de cada línea de DMAIX.',
      stats: [
        { value: '100%', label: 'Trazabilidad de OT' },
        { value: '-45%', label: 'Tiempo de parada' },
        { value: '0', label: 'Ceguera operativa' },
        { value: 'AAA', label: 'Contraste WCAG' },
      ],
      kristopherRole: 'Analista Programador | Desarrollador Fullstack | Lead Frontend Architect & UI Specialist',
      kristopherSpecialty: 'Especialista en Metodología Kanban & Interfaces Industriales',
      kristopherBio:
        'Desarrollador enfocado en la arquitectura técnica frontend, diseño UI/UX B2B y la implementación de tableros Kanban interactivos a pie de máquina.',
      kristopherGithub: 'Ver Perfil de GitHub',
      kristopherLinkedin: 'Ver Perfil de LinkedIn',
      yojanRole: 'Ingeniero Civil Industrial | Co-Founder',
      yojanSpecialty: 'Experto en Lean Six Sigma & Optimización de Procesos',
      yojanBio:
        'Profesional con amplia experiencia en metodologías industriales Lean y Six Sigma, dedicado a la eliminación de desperdicios y control estadístico DMAIC.',
      yojanLinkedin: 'Ver Perfil de LinkedIn',
    },
    banner: {
      badge: 'DMAIX Enterprise',
      pre: '¿Cuántos ',
      lossWord: 'clientes',
      mid: ' necesitas perder para usar ',
      dmaixWord: 'DMAIX',
      tagline: 'El Estándar Enterprise en Trazabilidad Metalúrgica y Control DMAIC',
    },
  },
  en: {
    hero: {
      words: ['Optimize', 'Automate', 'Accelerate', 'Digitize'],
      pre: 'Control and ',
      post: 'your metalworking production in real time',
      subtitle:
        'Eliminate operational blindness on the shop floor. DMAIX turns your Work Orders into high-performance metrics built on the DMAIC methodology.',
      ctaPrimary: 'Request Industrial Demo',
    },
    features: {
      heading: 'Built for the shop floor, not the office',
      subtitle: 'Every product decision answers a real industrial traceability problem.',
      prev: 'Previous',
      next: 'Next',
      close: 'Close',
      cards: [
        {
          category: 'Traceability',
          title: 'Work Order File Traceability',
          description: 'Every drawing, certificate and cutting sheet stays linked to its Work Order, always one click away.',
          lead: 'Nothing gets lost between stations.',
          points: [
            'Drawings, cutting sheets and certificates attached to every work order.',
            'Full history: who moved the work order, when and at which station.',
            'Conformity PDF ready for the client at dispatch.',
          ],
        },
        {
          category: 'Live alerts',
          title: 'Real-Time Stoppage Alerts',
          description: 'Machine failures, missing materials or quality issues: flagged instantly, without waiting for the shift report.',
          lead: 'Every minute stopped costs money.',
          points: [
            'Structured stoppage reasons for root cause analysis.',
            'The Control Tower flags stopped and at-risk work orders in real time.',
            'Stoppage reports exportable to Excel or CSV.',
          ],
        },
        {
          category: 'Integration',
          title: 'Data Integration',
          description: 'PLC sensors and ERP talk to the DMAIX Control Tower in a single data stream.',
          lead: 'One data stream for the whole plant.',
          points: [
            'Sales, production and dispatch connected on the same platform.',
            'Every checklist step updates the Tower KPIs instantly.',
            'Ready to connect PLC sensors and the company ERP.',
          ],
        },
        {
          category: 'Planning',
          title: 'Planning & History',
          description: 'Audit past production shifts and plan the next ones from a single calendar.',
          lead: 'The past explains the next shift.',
          points: [
            'Committed dates and lead time per station at a glance.',
            'Time study: available capacity vs. actual hours worked.',
            'The client follows their order stage by stage until delivery.',
          ],
        },
      ],
    },
    methodology: {
      heading: 'Lean, Six Sigma & Kanban Fundamentals',
      subtitle: "DMAIX isn't a generic dashboard: it's built on proven industrial methodology.",
    },
    dmaic: {
      title: 'The 5 DMAIC steps',
      periodLabel: 'Lean Six Sigma',
      imageAlt: 'Welder working in a metalworking plant',
      steps: [
        { id: 'define', heading: '01 Define', content: 'Scope the problem, its boundaries and what your client considers quality.', position: 'top' },
        { id: 'measure', heading: '02 Measure', content: 'Log real times per station and spot where capacity is being lost.', position: 'bottom' },
        { id: 'analyze', heading: '03 Analyze', content: 'Find the root cause of every stoppage with data, not assumptions.', position: 'top' },
        { id: 'improve', heading: '04 Improve', content: 'Balance the line and apply corrective actions where they matter most.', position: 'bottom' },
        { id: 'control', heading: '05 Control', content: 'Sustain the gains with live KPIs and alerts in the Control Tower.', position: 'top' },
      ],
    },
    team: {
      heading: 'Who builds this?',
      subtitle: 'A Latin American team with real shop-floor experience, behind every line of DMAIX.',
      stats: [
        { value: '100%', label: 'Work order tracking' },
        { value: '-45%', label: 'Downtime' },
        { value: '0', label: 'Operational blindness' },
        { value: 'AAA', label: 'WCAG contrast' },
      ],
      kristopherRole: 'Software Analyst | Fullstack Developer | Lead Frontend Architect & UI Specialist',
      kristopherSpecialty: 'Kanban Methodology & Industrial Interfaces Specialist',
      kristopherBio:
        'Developer focused on frontend technical architecture, B2B UI/UX design and the implementation of interactive Kanban boards right at the machine.',
      kristopherGithub: 'View GitHub Profile',
      kristopherLinkedin: 'View LinkedIn Profile',
      yojanRole: 'Industrial Civil Engineer | Co-Founder',
      yojanSpecialty: 'Lean Six Sigma & Process Optimization Expert',
      yojanBio:
        'Professional with extensive experience in Lean and Six Sigma industrial methodologies, dedicated to waste elimination and DMAIC statistical control.',
      yojanLinkedin: 'View LinkedIn Profile',
    },
    banner: {
      badge: 'DMAIX Enterprise',
      pre: 'How many ',
      lossWord: 'clients',
      mid: ' do you need to lose before using ',
      dmaixWord: 'DMAIX',
      tagline: 'The Enterprise Standard in Metalworking Traceability and DMAIC Control',
    },
  },
};

interface HomeProps {
  onLogin: () => void;
}

function HomeContent({ onLogin }: HomeProps) {
  const { language } = useLandingLanguage();
  const c = CONTENT[language];
  const featureVisuals = [MarqueeBackground, AnimatedListBackground, AnimatedBeamBackground, CalendarBackground];
  const featureImages = ['/operador_planta.jpeg', '/torre_de_control_app.jpeg', '/produccion_OT.jpeg', '/despacho_cliente_portal.jpeg'];
  const featureCards = c.features.cards.map((card, i) => {
    const Visual = featureVisuals[i];
    return (
      <Card
        key={card.title}
        closeLabel={c.features.close}
        card={{
          category: card.category,
          title: card.title,
          summary: card.description,
          src: featureImages[i],
          content: <CardDetail lead={card.lead} description={card.description} points={card.points} visual={<Visual />} />,
        }}
      />
    );
  });

  // Guía de Uso: se abre sola en la primera visita (ver `dmaix_wizard_completed`); la navbar la reabre.
  const [guideOpen, setGuideOpen] = useState(shouldShowWizard);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Las secciones fuera de pantalla quedan con `data-offscreen`: index.css congela sus
  // animaciones CSS (patrón 404, marquees, footer…) hasta que vuelven a verse.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const targets = root.querySelectorAll<HTMLElement>('main > section, main > [data-pausable]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) delete (entry.target as HTMLElement).dataset.offscreen;
          else (entry.target as HTMLElement).dataset.offscreen = '';
        });
      },
      { root, rootMargin: '150px 0px' },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={scrollerRef} className="h-screen snap-y snap-proximity overflow-y-scroll scroll-smooth bg-black text-slate-100">
      <LandingNavbar onLogin={onLogin} onOpenGuide={() => setGuideOpen(true)} />
      <OnboardingWizard open={guideOpen} onClose={() => setGuideOpen(false)} context="landing" onFinish={onLogin} language={language} />

      <main id="main-content">
        {/* SECCIÓN 1 — Pro Hero */}
        <section
          id="hero"
          className="relative flex min-h-screen snap-start flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-slate-950 to-black px-4 py-16 sm:px-6"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.25) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          <div className="pointer-events-none absolute -left-24 -top-24 size-[26rem] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 size-[26rem] rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.h1
              key={`hero-${language}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold leading-tight text-white sm:text-4xl"
            >
              {c.hero.pre}
              <FlipWords words={c.hero.words} className="font-bold text-cyan-400" />
              <br />
              {c.hero.post}
            </motion.h1>
            <motion.p
              key={`hero-sub-${language}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto mt-6 max-w-xl text-base text-slate-400 sm:text-lg"
            >
              {c.hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a href="#subscribe" className={PRIMARY_CTA_CLASSES}>
                <IconRocket className="size-4" /> {c.hero.ctaPrimary}
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECCIÓN 2 — Carrusel "Apple Cards": Diseñado para el piso de planta */}
        <section
          id="features"
          className="flex min-h-screen snap-start flex-col justify-center py-16"
          style={{ backgroundImage: 'linear-gradient(to bottom, black, #0B1528 50%, black)' }}
        >
          <Carousel
            prevLabel={c.features.prev}
            nextLabel={c.features.next}
            items={featureCards}
            header={
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={FADE_UP}
                transition={{ duration: 0.4 }}
              >
                <h2 className="max-w-3xl text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl">{c.features.heading}</h2>
                <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">{c.features.subtitle}</p>
              </motion.div>
            }
          />
        </section>

        {/* SECCIÓN 3 — Fundamentos Lean, Six Sigma & Kanban */}
        <section
          id="methodology"
          className="flex min-h-screen snap-start flex-col justify-center px-4 py-20 sm:px-6"
          style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(11,21,40,0.9), black 65%)' }}
        >
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{c.methodology.heading}</h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">{c.methodology.subtitle}</p>
          </div>
          <Marquee3DSection />
        </section>

        {/* SECCIÓN 4 — Los 5 pasos DMAIC: línea con scroll horizontal fijado (GSAP ScrollTrigger) */}
        <Timeline
          id="dmaic"
          title={c.dmaic.title}
          periodLabel={c.dmaic.periodLabel}
          steps={c.dmaic.steps}
          imageUrl="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80&auto=format&fit=crop"
          imageAlt={c.dmaic.imageAlt}
          backgroundColor="#000000"
          textColor="#ffffff"
          mutedTextColor="#94a3b8"
          activeColor="#06B6D4"
          duration={1.4}
        />

        {/* SECCIÓN 5 — ¿Quién construye esto? (tarjetas 3D del equipo) */}
        <section
          id="equipo"
          className="flex min-h-screen snap-start flex-col justify-center px-4 py-20 sm:px-6"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(37,99,235,0.12), black 70%)' }}
        >
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{c.team.heading}</h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">{c.team.subtitle}</p>
          </div>

          <div className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
            {c.team.stats.map((stat) => (
              <div key={stat.label}>
                <p className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-6">
            <KristopherCard
              name="Kristopher Astudillo"
              role={c.team.kristopherRole}
              specialty={c.team.kristopherSpecialty}
              bio={c.team.kristopherBio}
              githubLabel={c.team.kristopherGithub}
              linkedinLabel={c.team.kristopherLinkedin}
            />
            <YojanCard
              name="Yojan Chacón"
              role={c.team.yojanRole}
              specialty={c.team.yojanSpecialty}
              bio={c.team.yojanBio}
              linkedinLabel={c.team.yojanLinkedin}
            />
          </div>
        </section>

        {/* SECCIÓN 6 — Brand Banner (fondo animado 404 ERROR + SquigglyText) */}
        <section className="relative flex min-h-screen snap-start flex-col items-center justify-center overflow-hidden bg-[#0b1220] px-4 py-20 sm:px-6">
          <ErrorPattern />
          {/* Viñeta navy detrás del texto: el patrón queda de fondo sin competir con la pregunta. */}
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(11,18,32,0.94)_0%,rgba(11,18,32,0.7)_40%,rgba(11,18,32,0.15)_75%)]" />
          <div className="relative z-20 mx-auto max-w-4xl space-y-6 px-4 text-center">
            <span className="inline-block rounded-full border border-emerald-500/30 bg-blue-950/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md sm:text-sm">
              {c.banner.badge}
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {c.banner.pre}
              <SquigglyText className="text-red-500" scale={6} stepDuration={70}>
                {c.banner.lossWord}
              </SquigglyText>
              {c.banner.mid}
              <SquigglyText className="text-emerald-400" scale={5} stepDuration={80}>
                {c.banner.dmaixWord}
              </SquigglyText>
              ?
            </h2>
            <p className="mx-auto max-w-2xl text-base font-light text-neutral-300 md:text-lg">{c.banner.tagline}</p>
          </div>
        </section>


        {/* SECCIÓN 8 — Captura de Leads B2B (el footer cinemático va después, fuera de la sección) */}
        <section
          className="relative z-10 flex min-h-screen snap-start flex-col justify-center px-4 py-20 sm:px-6"
          style={{ backgroundImage: 'linear-gradient(to bottom, black, #0B1528 60%, black)' }}
        >
          <div className="flex flex-1 items-center justify-center py-10">
            <SignupFormDemo />
          </div>
        </section>

        <LandingFooter onLogin={onLogin} />
      </main>
    </div>
  );
}

export function Home({ onLogin }: HomeProps) {
  return (
    <LandingLanguageProvider>
      <HomeContent onLogin={onLogin} />
    </LandingLanguageProvider>
  );
}
