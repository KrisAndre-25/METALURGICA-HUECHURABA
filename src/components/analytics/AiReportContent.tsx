import type { ReactNode } from 'react';
import { AlertTriangle, Bot, Cpu, FileText, Users, Wrench } from 'lucide-react';
import type { BiAiAnalysis } from '../../types/bi';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { cn } from '../ui/cn';

function Block({ icon: Icon, title, children }: { icon: typeof FileText; title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forge-steel">
        <Icon className="size-3.5 text-forge-accent" />
        {title}
      </h4>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-100">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-forge-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Las 4 secciones del informe de IA, con el origen (Claude o motor local) a la vista. */
export function AiReportContent({ analysis }: { analysis: BiAiAnalysis }) {
  const { t } = useUiPrefs();
  const fromAi = analysis.source !== 'local';
  const sourceLabel = analysis.source === 'gemini' ? t.bi.sourceGemini : analysis.source === 'claude' ? t.bi.sourceClaude : t.bi.sourceLocal;

  return (
    <div className="space-y-4">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
          fromAi ? 'bg-forge-ok/10 text-forge-ok' : 'bg-forge-warn/10 text-forge-warn',
        )}
      >
        {fromAi ? <Bot className="size-3.5" /> : <Cpu className="size-3.5" />}
        {sourceLabel}
      </span>

      <Block icon={FileText} title={t.bi.sectionSummary}>
        <p className="text-sm leading-relaxed text-slate-100">{analysis.executiveSummary}</p>
      </Block>
      <Block icon={AlertTriangle} title={t.bi.sectionBottlenecks}>
        <BulletList items={analysis.bottlenecksAndIdle} />
      </Block>
      <Block icon={Users} title={t.bi.sectionStaffing}>
        <BulletList items={analysis.staffReorganization} />
      </Block>
      <Block icon={Wrench} title={t.bi.sectionRootCause}>
        <BulletList items={analysis.rootCauseAnalysis} />
      </Block>
    </div>
  );
}
