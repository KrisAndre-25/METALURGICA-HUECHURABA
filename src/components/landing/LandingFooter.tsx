import { IconBrandGithub, IconBrandLinkedin, IconLogin2, IconMapPin, IconRocket } from '@tabler/icons-react';
import { CinematicFooter } from '../ui/motion-footer';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

const TEXT: Record<
  LandingLanguage,
  {
    heading: string;
    marquee: string[];
    demo: string;
    login: string;
    links: { label: string; href: string }[];
    copyright: string;
    location: string;
    backToTop: string;
  }
> = {
  es: {
    heading: '¿Listo para controlar tu planta?',
    marquee: ['Trazabilidad total', 'Control DMAIC', 'OEE en vivo', 'Cero ceguera operativa', 'Lean Six Sigma'],
    demo: 'Solicitar Demo',
    login: 'Iniciar Sesión',
    links: [
      { label: 'Piso de Planta', href: '#features' },
      { label: 'Metodología', href: '#methodology' },
      { label: 'Pasos DMAIC', href: '#dmaic' },
      { label: 'Equipo', href: '#equipo' },
    ],
    copyright: '© 2026 DMAIX Enterprise. Todos los derechos reservados.',
    location: 'Santiago de Chile',
    backToTop: 'Volver arriba',
  },
  en: {
    heading: 'Ready to take control of your plant?',
    marquee: ['Full traceability', 'DMAIC control', 'Live OEE', 'Zero operational blindness', 'Lean Six Sigma'],
    demo: 'Request Demo',
    login: 'Log In',
    links: [
      { label: 'Shop Floor', href: '#features' },
      { label: 'Methodology', href: '#methodology' },
      { label: 'DMAIC Steps', href: '#dmaic' },
      { label: 'Team', href: '#equipo' },
    ],
    copyright: '© 2026 DMAIX Enterprise. All rights reserved.',
    location: 'Santiago, Chile',
    backToTop: 'Back to top',
  },
};

const PILL_ICON = 'size-5 text-slate-400 transition-colors group-hover:text-cyan-300';

/** Footer de la landing: `CinematicFooter` (revelado tipo telón) con contenido DMAIX. */
export function LandingFooter({ onLogin }: { onLogin: () => void }) {
  const { language } = useLandingLanguage();
  const t = TEXT[language];

  return (
    <CinematicFooter
      heading={t.heading}
      marquee={t.marquee}
      primary={[
        { label: t.demo, href: '#subscribe', icon: <IconRocket className={PILL_ICON} /> },
        { label: t.login, onClick: onLogin, icon: <IconLogin2 className={PILL_ICON} /> },
      ]}
      secondary={[
        ...t.links,
        { label: 'GitHub', href: 'https://github.com/kristopher-astudillo', external: true, icon: <IconBrandGithub className="size-4" /> },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yojan-alirio-chacon-rujano/', external: true, icon: <IconBrandLinkedin className="size-4" /> },
      ]}
      copyright={t.copyright}
      badge={
        <>
          <IconMapPin className="size-4 text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 md:text-xs">{t.location}</span>
          <span className="ml-1 text-xs font-black tracking-normal text-white md:text-sm">DMAIX</span>
        </>
      }
      backToTopLabel={t.backToTop}
    />
  );
}
