import { IconGauge, IconLayoutKanban, IconShieldCheck, IconTargetArrow } from '@tabler/icons-react';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

interface MethodCard {
  icon: typeof IconTargetArrow;
  title: string;
  description: string;
}

const METHODS: Record<LandingLanguage, MethodCard[]> = {
  es: [
    {
      icon: IconTargetArrow,
      title: 'DMAIC',
      description: 'Define, Mide, Analiza, Mejora y Controla cada ciclo de producción.',
    },
    {
      icon: IconLayoutKanban,
      title: 'Kanban Industrial',
      description: 'Visualización del flujo de OTs por las 7 estaciones críticas.',
    },
    {
      icon: IconShieldCheck,
      title: 'Poka-Yoke Digital',
      description: 'Prevención de errores en pantalla antes del despacho.',
    },
    {
      icon: IconGauge,
      title: 'OEE en Tiempo Real',
      description: 'Medición automática de Eficiencia General de los Equipos.',
    },
  ],
  en: [
    {
      icon: IconTargetArrow,
      title: 'DMAIC',
      description: 'Define, Measure, Analyze, Improve and Control every production cycle.',
    },
    {
      icon: IconLayoutKanban,
      title: 'Industrial Kanban',
      description: 'Visualization of work order flow across the 7 critical stations.',
    },
    {
      icon: IconShieldCheck,
      title: 'Digital Poka-Yoke',
      description: 'On-screen error prevention before dispatch.',
    },
    {
      icon: IconGauge,
      title: 'Real-Time OEE',
      description: 'Automatic measurement of Overall Equipment Effectiveness.',
    },
  ],
};

function MethodTile({ method }: { method: MethodCard }) {
  const Icon = method.icon;
  return (
    <div className="flex w-64 shrink-0 flex-col gap-2.5 rounded-2xl border border-blue-500/20 bg-slate-900/80 p-5 backdrop-blur-sm transition-colors hover:border-blue-500/50">
      <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-500/20">
        <Icon className="size-4.5 text-blue-400" />
      </div>
      <h4 className="text-sm font-semibold text-white">{method.title}</h4>
      <p className="text-xs leading-relaxed text-slate-400">{method.description}</p>
    </div>
  );
}

function Column({ items, reverse, duration, className }: { items: MethodCard[]; reverse?: boolean; duration: number; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`h-[520px] overflow-hidden ${className ?? ''}`}>
      <div
        className={reverse ? 'animate-marquee-vertical-reverse flex flex-col gap-4' : 'animate-marquee-vertical flex flex-col gap-4'}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((method, i) => (
          <MethodTile key={`${method.title}-${i}`} method={method} />
        ))}
      </div>
    </div>
  );
}

/**
 * Grilla vertical en 3D (perspectiva CSS) con 3 columnas de metodologías
 * moviéndose en direcciones alternadas — estilo Aceternity `Marquee3D`.
 */
export function Marquee3DSection() {
  const { language } = useLandingLanguage();
  const methods = METHODS[language];

  return (
    <div className="mx-auto max-w-4xl overflow-hidden" style={{ perspective: '1200px' }}>
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        style={{ transform: 'rotateX(12deg) rotateY(-8deg) rotateZ(4deg)', transformStyle: 'preserve-3d' }}
      >
        <Column items={methods} duration={26} />
        <Column items={[...methods].reverse()} reverse duration={22} />
        <Column items={methods} duration={30} className="hidden sm:block" />
      </div>
    </div>
  );
}
