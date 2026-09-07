import { motion } from 'framer-motion';
import { IconRocket } from '@tabler/icons-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { KristopherCard, YojanCard } from '../components/landing/TeamCards';
import { FlipWords } from '../components/landing/FlipWords';
import { BentoGrid, BentoCard } from '../components/landing/BentoGrid';
import { MarqueeBackground } from '../components/landing/MarqueeBackground';
import { AnimatedListBackground } from '../components/landing/AnimatedListBackground';
import { AnimatedBeamBackground } from '../components/landing/AnimatedBeamBackground';
import { CalendarBackground } from '../components/landing/CalendarBackground';
import { Marquee3DSection } from '../components/landing/Marquee3DSection';
import { TowerControlDemo } from '../components/landing/TowerControlDemo';
import { ContainerScroll } from '../components/landing/ContainerScroll';
import { LayoutGrid, type LayoutGridCard } from '../components/landing/LayoutGrid';
import { BackgroundBoxes } from '../components/landing/BackgroundBoxes';
import { SquigglyText } from '../components/landing/SquigglyText';
import { SignupFormDemo } from '../components/landing/SignupFormDemo';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingLanguageProvider, useLandingLanguage, type LandingLanguage } from '../contexts/LandingLanguageContext';
import { cn } from '../components/ui/cn';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const PRIMARY_CTA_CLASSES =
  'flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white ' +
  'shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-emerald-400 hover:shadow-[0_0_36px_rgba(16,185,129,0.5)]';

function PhotoThumb({ src, alt, contain, zoom }: { src: string; alt: string; contain?: boolean; zoom?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950">
      <img
        src={src}
        alt={alt}
        // object-top: prioriza mantener rostro/cabeza visible al recortar retratos verticales.
        // zoom: acerca el encuadre a la cara en fotos con mucho fondo alrededor de la persona
        // (scale sobre un contenedor overflow-hidden, sin distorsionar la imagen).
        className={cn(
          contain ? 'h-full w-full object-contain' : 'h-full w-full object-cover object-top',
          zoom && 'scale-110',
        )}
      />
    </div>
  );
}

interface Content {
  hero: { words: string[]; pre: string; post: string; subtitle: string; ctaPrimary: string };
  features: { heading: string; subtitle: string; cards: { title: string; description: string }[] };
  methodology: { heading: string; subtitle: string };
  torreControl: { badge: string; headingPre: string; headingHighlight: string; subtitle: string };
  team: {
    heading: string;
    subtitle: string;
    stats: { value: string; label: string }[];
    kristopherRole: string;
    kristopherSpecialty: string;
    kristopherBio: string;
    kristopherGithub: string;
    kristopherLinkedin: string;
    analyticsTitle: string;
    analyticsSubtitle: string;
    analyticsBio: string;
    yojanRole: string;
    yojanSpecialty: string;
    yojanBio: string;
    yojanLinkedin: string;
    operationalTitle: string;
    operationalSubtitle: string;
    operationalBio: string;
  };
  banner: { badge: string; pre: string; errorWord: string; mid: string; dmaixWord: string; tagline: string };
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
      cards: [
        { title: 'Trazabilidad de Archivos OT', description: 'Cada plano, certificado y hoja de corte queda vinculado a su Orden de Trabajo, siempre a un clic.' },
        {
          title: 'Alertas de Parada en Caliente',
          description: 'Fallas de máquina, falta de insumos o control de calidad — notificadas al instante, sin esperar el reporte de turno.',
        },
        { title: 'Integración de Datos', description: 'Sensores PLC y ERP conversan con la Torre de Control DMAIX en un solo flujo de datos.' },
        { title: 'Planificación e Histórico', description: 'Audita turnos de producción pasados y planifica los próximos desde un mismo calendario.' },
      ],
    },
    methodology: {
      heading: 'Fundamentos Lean, Six Sigma & Kanban',
      subtitle: 'DMAIX no es un dashboard genérico — está construido sobre metodología industrial probada.',
    },
    torreControl: {
      badge: 'Monitor de planta en tiempo real',
      headingPre: 'La Torre de Control, ',
      headingHighlight: 'en vivo',
      subtitle: 'OTs activas, estaciones críticas — Corte, Armado, Pintura — y métricas de turno, todo en una sola vista.',
    },
    team: {
      heading: '¿Quién construye esto y nuestra plataforma?',
      subtitle: 'Un equipo latinoamericano con experiencia real en planta, y el software que construyeron para resolverla. Toca una tarjeta para ver el detalle.',
      stats: [
        { value: '100%', label: 'Trazabilidad de OT' },
        { value: '-45%', label: 'Tiempo de parada' },
        { value: '0', label: 'Ceguera operativa' },
        { value: 'AAA', label: 'Contraste WCAG' },
      ],
      kristopherRole: 'Analista Programador | Lead Frontend Architect & UI Specialist',
      kristopherSpecialty: 'Especialista en Metodología Kanban & Interfaces Industriales',
      kristopherBio:
        'Desarrollador enfocado en la arquitectura técnica frontend, diseño UI/UX B2B y la implementación de tableros Kanban interactivos a pie de máquina.',
      kristopherGithub: 'Ver Perfil de GitHub',
      kristopherLinkedin: 'Ver Perfil de LinkedIn',
      analyticsTitle: 'Analítica Estratégica & Causa Raíz',
      analyticsSubtitle: 'Torre de Control para Administración',
      analyticsBio: 'Torre de control macro con KPIs de eficiencia OEE, para detectar lo que sucede en cada estación del proceso.',
      yojanRole: 'Ingeniero Civil Industrial | Co-Founder',
      yojanSpecialty: 'Experto en Lean Six Sigma & Optimización de Procesos',
      yojanBio:
        'Profesional con amplia experiencia en metodologías industriales Lean y Six Sigma, dedicado a la eliminación de desperdicios y control estadístico DMAIC.',
      yojanLinkedin: 'Ver Perfil de LinkedIn',
      operationalTitle: 'Módulo Operativo de Planta',
      operationalSubtitle: 'Fast Checklist para operarios',
      operationalBio: 'Visualización y control táctil del avance de Órdenes de Trabajo a pie de máquina.',
    },
    banner: {
      badge: 'DMAIX Enterprise',
      pre: '¿Cuántos ',
      errorWord: 'errores',
      mid: ' se necesitan para que uses ',
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
      cards: [
        { title: 'Work Order File Tracking', description: 'Every drawing, certificate and cut sheet stays linked to its Work Order, always one click away.' },
        {
          title: 'Real-Time Downtime Alerts',
          description: 'Machine failures, missing materials or quality issues — flagged instantly, without waiting for the shift report.',
        },
        { title: 'Data Integration', description: 'PLC sensors and ERP talk to the DMAIX Control Tower in a single data flow.' },
        { title: 'Planning & History', description: 'Audit past production shifts and plan upcoming ones from a single calendar.' },
      ],
    },
    methodology: {
      heading: 'Lean, Six Sigma & Kanban Fundamentals',
      subtitle: "DMAIX isn't a generic dashboard — it's built on proven industrial methodology.",
    },
    torreControl: {
      badge: 'Real-time plant monitor',
      headingPre: 'The Control Tower, ',
      headingHighlight: 'live',
      subtitle: 'Active work orders, critical stations — Cutting, Assembly, Painting — and shift metrics, all in a single view.',
    },
    team: {
      heading: 'Who builds this, and our platform?',
      subtitle: 'A Latin American team with real shop-floor experience, and the software they built to solve it. Tap a card to see the detail.',
      stats: [
        { value: '100%', label: 'Work order tracking' },
        { value: '-45%', label: 'Downtime' },
        { value: '0', label: 'Operational blindness' },
        { value: 'AAA', label: 'WCAG contrast' },
      ],
      kristopherRole: 'Software Analyst | Lead Frontend Architect & UI Specialist',
      kristopherSpecialty: 'Kanban Methodology & Industrial Interfaces Specialist',
      kristopherBio:
        'Developer focused on frontend technical architecture, B2B UI/UX design and the implementation of interactive Kanban boards right at the machine.',
      kristopherGithub: 'View GitHub Profile',
      kristopherLinkedin: 'View LinkedIn Profile',
      analyticsTitle: 'Strategic Analytics & Root Cause',
      analyticsSubtitle: 'Control Tower for Management',
      analyticsBio: 'Macro control tower with OEE efficiency KPIs, to detect what is happening at every station in the process.',
      yojanRole: 'Industrial Civil Engineer | Co-Founder',
      yojanSpecialty: 'Lean Six Sigma & Process Optimization Expert',
      yojanBio:
        'Professional with extensive experience in Lean and Six Sigma industrial methodologies, dedicated to waste elimination and DMAIC statistical control.',
      yojanLinkedin: 'View LinkedIn Profile',
      operationalTitle: 'Shop-Floor Operations Module',
      operationalSubtitle: 'Fast Checklist for operators',
      operationalBio: 'Touch-first visualization and control of Work Order progress right at the machine.',
    },
    banner: {
      badge: 'DMAIX Enterprise',
      pre: 'How many ',
      errorWord: 'errors',
      mid: ' does it take for you to use ',
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

  // Kristopher y Yojan usan la tarjeta con efecto Lens (ver TeamCards.tsx), fuera del
  // LayoutGrid — sus 2 tarjetas quedan intactas abajo, ahora a ancho completo.
  const teamCards: LayoutGridCard[] = [
    {
      id: 4,
      // Rectángulo grande: la captura de la Torre de Control (analítica) se ve completa aquí.
      className: 'md:col-span-3',
      thumbnail: <PhotoThumb src="/dashboard1.png" alt="Torre de Control — analítica y causa raíz" contain />,
      title: c.team.analyticsTitle,
      subtitle: c.team.analyticsSubtitle,
      content: <p className="text-xs leading-relaxed text-neutral-300 md:text-sm">{c.team.analyticsBio}</p>,
    },
    {
      id: 3,
      // Rectángulo grande: la captura del Fast Checklist se ve completa aquí.
      className: 'md:col-span-3',
      thumbnail: <PhotoThumb src="/dashboard2.png" alt="Módulo operativo de planta — Fast Checklist" contain />,
      title: c.team.operationalTitle,
      subtitle: c.team.operationalSubtitle,
      content: <p className="text-xs leading-relaxed text-neutral-300 md:text-sm">{c.team.operationalBio}</p>,
    },
  ];

  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth bg-black text-slate-100">
      <LandingNavbar onLogin={onLogin} />

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

        {/* SECCIÓN 2 — Bento Grid: Diseñado para el piso de planta */}
        <section
          id="features"
          className="flex min-h-screen snap-start flex-col justify-center px-4 py-20 sm:px-6"
          style={{ backgroundImage: 'linear-gradient(to bottom, black, #0B1528 50%, black)' }}
        >
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto w-full max-w-5xl"
          >
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{c.features.heading}</h2>
              <p className="mt-3 text-sm text-slate-400 sm:text-base">{c.features.subtitle}</p>
            </div>

            <BentoGrid className="mt-10">
              <motion.div variants={FADE_UP} transition={{ duration: 0.4 }}>
                <BentoCard title={c.features.cards[0].title} description={c.features.cards[0].description} background={<MarqueeBackground />} />
              </motion.div>
              <motion.div variants={FADE_UP} transition={{ duration: 0.4 }}>
                <BentoCard title={c.features.cards[1].title} description={c.features.cards[1].description} background={<AnimatedListBackground />} />
              </motion.div>
              <motion.div variants={FADE_UP} transition={{ duration: 0.4 }}>
                <BentoCard title={c.features.cards[2].title} description={c.features.cards[2].description} background={<AnimatedBeamBackground />} />
              </motion.div>
              <motion.div variants={FADE_UP} transition={{ duration: 0.4 }}>
                <BentoCard title={c.features.cards[3].title} description={c.features.cards[3].description} background={<CalendarBackground />} />
              </motion.div>
            </BentoGrid>
          </motion.div>
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

        {/* SECCIÓN 4 — Torre de Control Interactiva, con perspectiva 3D al hacer scroll */}
        <section id="torre-control" className="flex min-h-screen snap-start flex-col justify-center bg-black px-4 py-16 sm:px-6">
          <ContainerScroll
            titleComponent={
              <div className="mx-auto mb-2 max-w-2xl px-4 text-center">
                <span className="mb-3 inline-block rounded-full border border-emerald-500/30 bg-blue-950/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md sm:text-sm">
                  {c.torreControl.badge}
                </span>
                <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                  {c.torreControl.headingPre}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    {c.torreControl.headingHighlight}
                  </span>
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm font-light leading-relaxed text-neutral-300 sm:text-base">{c.torreControl.subtitle}</p>
              </div>
            }
          >
            <TowerControlDemo />
          </ContainerScroll>
        </section>

        {/* SECCIÓN 5 — ¿Quién construye esto y nuestra plataforma? (LayoutGrid) */}
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

          <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <KristopherCard
              name="Kristopher Astudillo"
              role={c.team.kristopherRole}
              specialty={c.team.kristopherSpecialty}
              bio={c.team.kristopherBio}
            />
            <YojanCard name="Yojan Chacón" role={c.team.yojanRole} specialty={c.team.yojanSpecialty} bio={c.team.yojanBio} />
          </div>

          <LayoutGrid cards={teamCards} />
        </section>

        {/* SECCIÓN 6 — Brand Banner Interactivo (BackgroundBoxes + SquigglyText) */}
        <section className="relative flex min-h-screen snap-start flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 sm:px-6">
          <BackgroundBoxes />
          <div className="relative z-20 mx-auto max-w-4xl space-y-6 px-4 text-center">
            <span className="inline-block rounded-full border border-emerald-500/30 bg-blue-950/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md sm:text-sm">
              {c.banner.badge}
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {c.banner.pre}
              <SquigglyText className="text-red-500" scale={6} stepDuration={70}>
                {c.banner.errorWord}
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


        {/* SECCIÓN 8 + 9 — Captura de Leads B2B + Footer PRO */}
        <section
          className="flex min-h-screen snap-start flex-col justify-between px-4 pt-20 sm:px-6"
          style={{ backgroundImage: 'linear-gradient(to bottom, black, #0B1528 60%, black)' }}
        >
          <div className="flex flex-1 items-center justify-center py-10">
            <SignupFormDemo />
          </div>
          <LandingFooter />
        </section>
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
