import { motion, useReducedMotion } from 'framer-motion';
import { MapPin } from 'lucide-react';
// La versión instalada de lucide-react retiró los íconos de marca (GitHub, LinkedIn,
// Facebook, Instagram); se usan los equivalentes de @tabler/icons-react, ya
// dependencia del proyecto.
import { IconBrandFacebook, IconBrandGithub, IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react';
import { useToast } from '../ui/Toast';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

interface FooterLink {
  label: string;
  href: string;
  /** Sin destino real (docs/API que no existen en este prototipo) — muestra un aviso en vez de un link muerto. */
  comingSoon?: boolean;
}

const TEXT: Record<
  LandingLanguage,
  {
    tagline: string;
    product: string;
    company: string;
    resources: string;
    productLinks: FooterLink[];
    companyLinks: FooterLink[];
    resourcesLinks: FooterLink[];
    copyright: string;
    madeWith: string;
    comingSoon: (label: string) => string;
  }
> = {
  es: {
    tagline: 'Trazabilidad industrial y optimización de planta basada en Lean Six Sigma / DMAIC.',
    product: 'Producto',
    company: 'Empresa',
    resources: 'Recursos',
    productLinks: [
      { label: 'Características', href: '#features' },
      { label: 'Métricas OEE', href: '#methodology' },
      { label: 'Trazabilidad OT', href: '#features' },
      { label: 'Prototipo B2B', href: '#torre-control' },
    ],
    companyLinks: [
      { label: 'Sobre Nosotros', href: '#equipo' },
      { label: 'Metodología DMAIC', href: '#methodology' },
      { label: 'Equipo', href: '#equipo' },
      { label: 'Contacto', href: '#subscribe' },
    ],
    resourcesLinks: [
      { label: 'Documentación Técnica', href: '#', comingSoon: true },
      { label: 'Guía Lean', href: '#', comingSoon: true },
      { label: 'API Planta', href: '#', comingSoon: true },
      { label: 'Estado del Servicio', href: '#', comingSoon: true },
    ],
    copyright: '© 2026 DMAIX Enterprise. Todos los derechos reservados.',
    madeWith: 'Hecho con',
    comingSoon: (label) => `"${label}" estará disponible próximamente.`,
  },
  en: {
    tagline: 'Industrial traceability and shop-floor optimization built on Lean Six Sigma / DMAIC.',
    product: 'Product',
    company: 'Company',
    resources: 'Resources',
    productLinks: [
      { label: 'Features', href: '#features' },
      { label: 'OEE Metrics', href: '#methodology' },
      { label: 'Work Order Tracking', href: '#features' },
      { label: 'B2B Prototype', href: '#torre-control' },
    ],
    companyLinks: [
      { label: 'About Us', href: '#equipo' },
      { label: 'DMAIC Methodology', href: '#methodology' },
      { label: 'Team', href: '#equipo' },
      { label: 'Contact', href: '#subscribe' },
    ],
    resourcesLinks: [
      { label: 'Technical Docs', href: '#', comingSoon: true },
      { label: 'Lean Guide', href: '#', comingSoon: true },
      { label: 'Plant API', href: '#', comingSoon: true },
      { label: 'Service Status', href: '#', comingSoon: true },
    ],
    copyright: '© 2026 DMAIX Enterprise. All rights reserved.',
    madeWith: 'Made with',
    comingSoon: (label) => `"${label}" will be available soon.`,
  },
};

const REAL_SOCIALS = [
  { icon: IconBrandGithub, label: 'GitHub', href: 'https://github.com/kristopher-astudillo' },
  { icon: IconBrandLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/yojan-alirio-chacon-rujano/' },
];

const COMING_SOON_SOCIALS = [
  { icon: IconBrandFacebook, label: 'Facebook' },
  { icon: IconBrandInstagram, label: 'Instagram' },
];

const SOCIAL_ICON_CLASSES =
  'flex size-9 items-center justify-center rounded-full border border-blue-900/40 text-slate-400 ' +
  'transition-colors hover:border-blue-500/60 hover:text-blue-400';

function FooterColumn({ title, links, onComingSoon }: { title: string; links: FooterLink[]; onComingSoon: (label: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) =>
          link.comingSoon ? (
            <li key={link.label}>
              <button type="button" onClick={() => onComingSoon(link.label)} className="text-sm text-slate-400 transition-colors hover:text-white">
                {link.label}
              </button>
            </li>
          ) : (
            <li key={link.label}>
              <a href={link.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                {link.label}
              </a>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  const { language } = useLandingLanguage();
  const t = TEXT[language];
  const { showToast } = useToast();
  const reduceMotion = useReducedMotion();

  const handleComingSoon = (label: string) => showToast(t.comingSoon(label), 'info');

  return (
    <footer className="relative overflow-hidden rounded-t-[2rem] border-t border-blue-900/40 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(59,130,246,0.18),transparent)] bg-slate-950 px-6 py-12 md:rounded-t-[3rem] lg:py-16">
      <div className="pointer-events-none absolute -translate-y-1/2 left-1/2 right-1/2 top-0 h-px w-1/3 -translate-x-1/2 rounded-full bg-blue-500/30 blur-sm" />

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: reduceMotion ? 0 : 0.5 }}
        className="relative mx-auto max-w-6xl"
      >
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src="/icono_software.png" alt="DMAIX Logo" className="h-8 w-8 rounded-full object-cover" />
              <span className="text-sm font-bold text-white">DMAIX Enterprise</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{t.tagline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {REAL_SOCIALS.map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={SOCIAL_ICON_CLASSES}>
                  <Icon className="size-4" />
                </a>
              ))}
              {COMING_SOON_SOCIALS.map(({ icon: Icon, label }) => (
                <button key={label} type="button" aria-label={label} onClick={() => handleComingSoon(label)} className={SOCIAL_ICON_CLASSES}>
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <FooterColumn title={t.product} links={t.productLinks} onComingSoon={handleComingSoon} />
          <FooterColumn title={t.company} links={t.companyLinks} onComingSoon={handleComingSoon} />
          <FooterColumn title={t.resources} links={t.resourcesLinks} onComingSoon={handleComingSoon} />
        </div>

        <div className="mt-10 flex flex-col items-center gap-1.5 border-t border-blue-900/20 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">{t.copyright}</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="size-3.5 shrink-0" />
            {t.madeWith} <span className="text-red-400">♥</span> {language === 'es' ? 'en Santiago de Chile' : 'in Santiago, Chile'}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
