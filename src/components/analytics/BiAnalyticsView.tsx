import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Archive, BarChart3, CalendarRange, Gauge, Hourglass, OctagonX, Save, Settings2, Sparkles, Users } from 'lucide-react';
import type { BiAiAnalysis, BiKpiSnapshot, BiReportType, StationCapacity } from '../../types/bi';
import { useOrders } from '../../hooks/useOrders';
import { useBi } from '../../contexts/BiContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useToast } from '../ui/Toast';
import { useChartTheme } from '../dashboard/chartTheme';
import { calculateTimeStudy, monthBounds, parseDateInputRange, toDateInputValue, windowForReportType } from '../../utils/timeStudyCalculators';
import { generateBiAnalysis } from '../../services/biAnalysisService';
import { formatDate, formatMonth, formatShiftHours, formatStation, formatStationShort } from '../../utils/formatters';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { cn } from '../ui/cn';
import { AiReportContent } from './AiReportContent';
import { ReportHistory } from './ReportHistory';

/** Colores de serie: cian = capacidad (acento de marca), esmeralda = trabajo, rojo = parada, ámbar = ocio. */
const SERIES = [
  { key: 'available', color: 'var(--color-forge-accent)' },
  { key: 'worked', color: 'var(--color-forge-ok)' },
  { key: 'stopped', color: 'var(--color-forge-stopped)' },
  { key: 'idle', color: 'var(--color-forge-warn)' },
] as const;

const GENERATOR_TYPES: BiReportType[] = ['DIARIO', 'SEMANAL', 'MENSUAL', 'A_PEDIDO'];

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function SectionHeading({ icon: Icon, children }: { icon: typeof Gauge; children: ReactNode }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forge-steel">
      <Icon className="size-3.5 text-forge-accent" />
      {children}
    </h3>
  );
}

type KpiTone = 'accent' | 'ok' | 'warn' | 'stopped';

const KPI_TONES: Record<KpiTone, { icon: string; badge: string }> = {
  accent: { icon: 'text-forge-accent', badge: 'bg-forge-accent/10' },
  ok: { icon: 'text-forge-ok', badge: 'bg-forge-ok/10' },
  warn: { icon: 'text-forge-warn', badge: 'bg-forge-warn/10' },
  stopped: { icon: 'text-forge-stopped', badge: 'bg-forge-stopped/10' },
};

function KpiCard({ icon: Icon, label, value, hint, tone }: { icon: typeof Gauge; label: string; value: string; hint: string; tone: KpiTone }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="rounded-xl border border-forge-border bg-forge-surface p-4 shadow-lg shadow-black/20 high-contrast:border-2">
      <div className="mb-2 flex items-center gap-2">
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', KPI_TONES[tone].badge)}>
          <Icon className={cn('size-4', KPI_TONES[tone].icon)} />
        </span>
        <p className="text-[11px] font-medium uppercase tracking-wide text-forge-steel">{label}</p>
      </div>
      <p className="text-2xl font-bold leading-tight text-slate-100">{value}</p>
      <p className="mt-0.5 text-[11px] text-forge-steel">{hint}</p>
    </motion.div>
  );
}

/** Tono de la barra de utilización: sobre 85% es cuello de botella, bajo 50% hay holgura. */
function utilizationTone(pct: number): string {
  if (pct >= 85) return 'bg-forge-risk';
  if (pct < 50) return 'bg-forge-warn';
  return 'bg-forge-ok';
}

function CapacityEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { capacities, updateCapacities } = useBi();
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<StationCapacity[]>(capacities);
  const [wasOpen, setWasOpen] = useState(open);
  // Al abrir, el borrador parte de la capacidad vigente (no de una edición descartada).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(capacities);
  }

  const patch = (index: number, field: 'weeklyHours' | 'operators', value: string) => {
    const n = Math.max(0, Math.min(Number(value) || 0, field === 'weeklyHours' ? 168 : 50));
    setDraft((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: n } : c)));
  };

  return (
    <Modal open={open} onClose={onClose} title={t.bi.capacityTitle}>
      <p className="mb-4 text-xs text-forge-steel">{t.bi.capacityHint}</p>
      <div className="space-y-3">
        {draft.map((c, i) => (
          <div key={c.station} className="grid grid-cols-[1fr_6rem_6rem] items-end gap-2">
            <p className="pb-4 text-sm font-medium text-slate-100">{formatStation(c.station, language)}</p>
            <Input label={t.bi.capacityWeeklyHours} type="number" min={0} max={168} value={c.weeklyHours} onChange={(e) => patch(i, 'weeklyHours', e.target.value)} />
            <Input label={t.bi.capacityOperators} type="number" min={0} max={50} value={c.operators} onChange={(e) => patch(i, 'operators', e.target.value)} />
          </div>
        ))}
      </div>
      <Button
        className="mt-5"
        fullWidth
        size="lg"
        icon={<Save className="size-4" />}
        onClick={() => {
          updateCapacities(draft);
          showToast(t.bi.capacitySaved);
          onClose();
        }}
      >
        {t.bi.capacitySave}
      </Button>
    </Modal>
  );
}

interface GeneratedReport {
  type: BiReportType;
  kpis: BiKpiSnapshot;
  analysis: BiAiAnalysis;
  saved: boolean;
}

function ReportGenerator() {
  const { allOrders } = useOrders();
  const { capacities, saveReport } = useBi();
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();

  const today = new Date();
  const [type, setType] = useState<BiReportType>('SEMANAL');
  const [customFrom, setCustomFrom] = useState(() => toDateInputValue(monthBounds(today).from));
  const [customTo, setCustomTo] = useState(() => toDateInputValue(today));
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedReport | null>(null);

  const range = type === 'A_PEDIDO' ? parseDateInputRange(customFrom, customTo) : windowForReportType(type as 'DIARIO' | 'SEMANAL' | 'MENSUAL');

  const handleGenerate = async () => {
    if (!range) return;
    setGenerating(true);
    setResult(null);
    const kpis = calculateTimeStudy(allOrders, capacities, range.from.toISOString(), range.to.toISOString());
    const analysis = await generateBiAnalysis(kpis, language, t);
    setResult({ type, kpis, analysis, saved: false });
    setGenerating(false);
  };

  const handleSave = () => {
    if (!result || result.saved) return;
    saveReport({ type: result.type, kpis: result.kpis, analysis: result.analysis });
    setResult({ ...result, saved: true });
    showToast(t.bi.savedToast);
  };

  return (
    <Card>
      <div className="flex flex-wrap gap-2">
        {GENERATOR_TYPES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={cn(
              'h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors',
              type === option
                ? 'border-forge-accent bg-forge-accent/15 text-forge-accent'
                : 'border-forge-border text-forge-steel hover:border-forge-accent/40 hover:text-slate-100',
            )}
          >
            {t.bi.typeLabels[option]}
          </button>
        ))}
      </div>

      {type === 'A_PEDIDO' && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input label={t.bi.fromLabel} type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} />
          <Input label={t.bi.toLabel} type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} />
        </div>
      )}

      <p className={cn('mt-3 flex items-center gap-1.5 text-xs', range ? 'text-forge-steel' : 'text-forge-stopped')}>
        <CalendarRange className="size-3.5" />
        {range ? t.bi.periodLabel(formatDate(range.from.toISOString(), language), formatDate(range.to.toISOString(), language)) : t.bi.invalidRange}
      </p>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <Button className="sm:flex-1" size="lg" icon={<Sparkles className="size-4" />} loading={generating} disabled={!range} onClick={handleGenerate}>
          {generating ? t.bi.generating : t.bi.generate}
        </Button>
        <Button
          className="sm:flex-1"
          size="lg"
          variant="secondary"
          icon={<Archive className="size-4" />}
          disabled={!result || result.saved || generating}
          onClick={handleSave}
        >
          {result?.saved ? t.bi.savedBadge : t.bi.save}
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl border border-forge-accent/30 bg-forge-surface-2/40 p-4">
          <p className="mb-3 text-xs font-semibold text-slate-100">
            {t.bi.typeLabels[result.type]} · {t.bi.periodLabel(formatDate(result.kpis.from, language), formatDate(result.kpis.to, language))}
          </p>
          <AiReportContent analysis={result.analysis} />
        </motion.div>
      )}
    </Card>
  );
}

/**
 * "Analítica BI & Estudio de Tiempos" (solo ADMIN): KPIs del mes en curso,
 * comparativo de horas por estación, generador de reportes con IA e historial
 * archivado. La ventana activa es siempre el mes calendario en curso — no
 * arrastra meses anteriores; esos quedan en los reportes de Cierre de Mes.
 */
export function BiAnalyticsView() {
  const { allOrders } = useOrders();
  const { capacities } = useBi();
  const { t, language, highContrast } = useUiPrefs();
  const chartTheme = useChartTheme(highContrast);
  const [capacityOpen, setCapacityOpen] = useState(false);

  const now = new Date();
  // Ventana activa = mes calendario en curso, desde el día 1 hasta ahora.
  const study = calculateTimeStudy(allOrders, capacities, monthBounds(now).from.toISOString(), now.toISOString());
  const stopCount = study.stations.reduce((sum, s) => sum + s.stopCount, 0);

  const seriesLabel: Record<(typeof SERIES)[number]['key'], string> = {
    available: t.bi.seriesAvailable,
    worked: t.bi.seriesWorked,
    stopped: t.bi.seriesStopped,
    idle: t.bi.seriesIdle,
  };
  const chartData = study.stations.map((s) => ({
    station: formatStationShort(s.station, language),
    available: s.availableHours,
    worked: s.workedHours,
    stopped: s.stoppedHours,
    idle: s.idleHours,
  }));

  const h = (n: number) => formatShiftHours(n, language);

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }} className="space-y-5 pb-24">
      <motion.div variants={SECTION_VARIANTS}>
        <h1 className="hidden text-xl font-bold text-slate-100 sm:block">{t.bi.title}</h1>
        <p className="text-sm text-forge-steel">{t.bi.activeWindow(formatMonth(now, language))}</p>
      </motion.div>

      <motion.div variants={SECTION_VARIANTS} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={Gauge} tone="accent" label={t.bi.kpiOee} value={`${study.oeePct}%`} hint={t.bi.kpiOeeHint(study.availabilityPct, study.performancePct, study.qualityPct)} />
        <KpiCard icon={Hourglass} tone="warn" label={t.bi.kpiIdle} value={h(study.totalIdleHours)} hint={t.bi.kpiIdleHint(h(study.totalAvailableHours))} />
        <KpiCard icon={OctagonX} tone="stopped" label={t.bi.kpiStopped} value={h(study.totalStoppedHours)} hint={t.bi.kpiStoppedHint(stopCount)} />
        <KpiCard icon={Users} tone="ok" label={t.bi.kpiStaff} value={`${study.staffUtilizationPct}%`} hint={t.bi.kpiStaffHint} />
      </motion.div>

      <motion.div variants={SECTION_VARIANTS} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>{t.bi.sectionChart}</CardTitle>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -12 }} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                <XAxis dataKey="station" tick={{ fill: chartTheme.axisFill, fontSize: 10 }} interval={0} />
                <YAxis tick={{ fill: chartTheme.axisFill, fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    border: `2px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: 8,
                    fontSize: 12,
                    color: chartTheme.tooltipText,
                    fontWeight: highContrast ? 700 : 500,
                  }}
                  itemStyle={{ color: chartTheme.tooltipText }}
                  labelStyle={{ color: chartTheme.tooltipText, fontWeight: 700 }}
                  cursor={{ fill: chartTheme.cursorFill }}
                  formatter={(value, name) => [h(Number(value)), seriesLabel[name as keyof typeof seriesLabel] ?? name]}
                />
                {SERIES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} animationDuration={700} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-forge-steel">
            {SERIES.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {seriesLabel[s.key]}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t.bi.sectionUtilization}</CardTitle>
            <button
              type="button"
              onClick={() => setCapacityOpen(true)}
              aria-label={t.bi.editCapacity}
              title={t.bi.editCapacity}
              className="rounded-lg p-1.5 text-forge-accent hover:bg-forge-surface-2"
            >
              <Settings2 className="size-4" />
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {study.stations.map((s) => (
              <li key={s.station}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-slate-100">{formatStation(s.station, language)}</span>
                  <span className="shrink-0 text-forge-steel">
                    {t.bi.operators(s.operators)} · <span className="font-semibold text-slate-100">{s.utilizationPct}%</span>
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-forge-border">
                  <div className={cn('h-full rounded-full transition-all', utilizationTone(s.utilizationPct))} style={{ width: `${Math.min(s.utilizationPct, 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <motion.div variants={SECTION_VARIANTS}>
        <SectionHeading icon={Sparkles}>{t.bi.sectionGenerator}</SectionHeading>
        <ReportGenerator />
      </motion.div>

      <motion.div variants={SECTION_VARIANTS}>
        <SectionHeading icon={BarChart3}>{t.bi.sectionHistory}</SectionHeading>
        <ReportHistory />
      </motion.div>

      <CapacityEditor open={capacityOpen} onClose={() => setCapacityOpen(false)} />
    </motion.div>
  );
}
