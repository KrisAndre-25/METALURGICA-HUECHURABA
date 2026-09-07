import { IconFileText, IconFileTypePdf, IconFileTypeXls, IconPhoto } from '@tabler/icons-react';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

interface FileChip {
  name: string;
  icon: typeof IconFileText;
}

const FILES: Record<LandingLanguage, FileChip[]> = {
  es: [
    { name: 'OT-1002_Estructura.pdf', icon: IconFileTypePdf },
    { name: 'Corte_Planta_A.xlsx', icon: IconFileTypeXls },
    { name: 'Plano_Nave.svg', icon: IconPhoto },
    { name: 'Certificado_Calidad.pdf', icon: IconFileTypePdf },
  ],
  en: [
    { name: 'WO-1002_Structure.pdf', icon: IconFileTypePdf },
    { name: 'Cutting_PlantA.xlsx', icon: IconFileTypeXls },
    { name: 'Bay_Drawing.svg', icon: IconPhoto },
    { name: 'Quality_Certificate.pdf', icon: IconFileTypePdf },
  ],
};

function Row({ files, reverse }: { files: FileChip[]; reverse?: boolean }) {
  const items = [...files, ...files];
  return (
    <div className={`flex w-max gap-3 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
      {items.map(({ name, icon: Icon }, i) => (
        <div
          key={`${name}-${i}`}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-900/40 bg-black/60 px-3.5 py-2.5"
        >
          <Icon className="size-4 shrink-0 text-blue-400" />
          <span className="whitespace-nowrap text-xs text-slate-300">{name}</span>
        </div>
      ))}
    </div>
  );
}

/** Marquee horizontal infinito con dos filas desfasadas — trazabilidad documental de una OT. */
export function MarqueeBackground() {
  const { language } = useLandingLanguage();
  const files = FILES[language];
  return (
    <div className="flex h-full flex-col justify-center gap-3 overflow-hidden pt-6">
      <Row files={files} />
      <Row files={files} reverse />
    </div>
  );
}
