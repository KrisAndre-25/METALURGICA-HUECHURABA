import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertOctagon, Banknote, Gauge, ListChecks, OctagonX, PackageCheck, Radio, Route, Truck } from 'lucide-react';
import type { Station } from '../../types/order';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useDiagnosticEngine } from '../../hooks/useDiagnosticEngine';
import { calculatePlantKpis, calculateStationLoad, summarizeByStatus, summarizeDelayReasons } from '../../utils/kpiCalculators';
import { formatDelayReason, formatRelativeTime, formatStation, formatStatus, formatUF } from '../../utils/formatters';
import { HealthScoreGauge } from './HealthScoreGauge';
import { PipelineFlow } from './PipelineFlow';
import { DiagnosticBanner } from './DiagnosticBanner';
import { Card, CardTitle } from '../ui/Card';
import { OrderCardTouch } from '../orders/OrderCardTouch';
import { OrderDetailSheet } from '../orders/OrderDetailSheet';
import { PendingSalesRequestsSection } from '../orders/PendingSalesRequestsSection';
import { cn } from '../ui/cn';

const STATUS_COLORS: Record<string, string> = {
  EN_TIEMPO: '#22c55e',
  EN_RIESGO: '#eab308',
  ATRASADO: '#f97316',
  DETENIDO: '#ef4444',
  COMPLETADO: '#8a94a3',
};

const DELAY_REASON_COLORS: Record<string, string> = {
  AVERIA_MAQUINARIA: '#ef4444',
  FALTA_INSUMOS: '#f97316',
  FALTA_PERSONAL: '#eab308',
  CORTE_LUZ: '#8b5cf6',
  ESPERA_INSPECCION: '#38bdf8',
};

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={SECTION_VARIANTS} transition={{ duration: 0.35, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionHeading({ icon: Icon, children, count }: { icon: typeof Truck; children: ReactNode; count?: number }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forge-steel">
      <Icon className="size-3.5 text-forge-accent" />
      {children}
      {count !== undefined && <span className="text-forge-steel/70">({count})</span>}
    </h3>
  );
}

export function ControlTower() {
  const { allOrders, purchaseOrders, salesRequests, shipments } = useOrders();
  const { user } = useAuth();
  const { t, language } = useUiPrefs();
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  // Solo el ID: el sheet siempre debe reflejar la OT viva, no una foto tomada al abrirlo.
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = allOrders.find((o) => o.id === selectedOrderId) ?? null;

  const insights = useDiagnosticEngine(allOrders, language);
  const kpis = useMemo(() => calculatePlantKpis(allOrders, purchaseOrders), [allOrders, purchaseOrders]);
  const stationLoad = useMemo(() => calculateStationLoad(allOrders), [allOrders]);
  const statusSummary = useMemo(
    () => summarizeByStatus(allOrders.filter((o) => o.status !== 'COMPLETADO')),
    [allOrders],
  );
  const delayReasons = useMemo(() => summarizeDelayReasons(allOrders), [allOrders]);
  const stoppedOrders = useMemo(() => allOrders.filter((o) => o.status === 'DETENIDO'), [allOrders]);

  const visibleOrders = useMemo(() => {
    const active = allOrders.filter((o) => o.status !== 'COMPLETADO');
    return activeStation ? active.filter((o) => o.currentStation === activeStation) : active;
  }, [allOrders, activeStation]);

  const statusChartData = statusSummary.map((s) => ({ name: formatStatus(s.status, language), status: s.status, value: s.count }));
  const leadTimeData = stationLoad.map((s) => ({ station: formatStation(s.station, language), horas: Math.round(s.averageLeadTimeHours) }));
  const delayChartData = delayReasons.map((d) => ({ name: formatDelayReason(d.reason, language), reason: d.reason, value: d.count }));

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      className="space-y-5 pb-24"
    >
      <Section>
        <div className="mb-3 hidden items-center justify-between sm:flex">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-100">
              {t.controlTower.title}
              <span className="flex items-center gap-1 rounded-full bg-forge-ok/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-forge-ok">
                <Radio className="size-2.5 animate-pulse" /> {t.controlTower.live}
              </span>
            </h1>
            <p className="text-sm text-forge-steel">{t.controlTower.subtitle}</p>
          </div>
        </div>

        <Card accent="accent" className="flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
          <HealthScoreGauge score={kpis.plantHealthScore} />
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
            <MiniKpi icon={PackageCheck} label={t.controlTower.kpiOtd} value={`${kpis.onTimeDeliveryPercentage}%`} tone="ok" />
            <MiniKpi icon={Gauge} label={t.controlTower.kpiCycle} value={`${kpis.averageCycleTimeDays} d`} tone="neutral" />
            <MiniKpi icon={Banknote} label={t.controlTower.kpiAmount} value={formatUF(kpis.activeAmountUF, language)} tone="accent" />
            <MiniKpi icon={AlertOctagon} label={t.controlTower.kpiStopped} value={String(kpis.stoppedOrders)} tone="stopped" />
          </div>
        </Card>
      </Section>

      <Section>
        <DiagnosticBanner insights={insights} />
      </Section>

      {user?.role === 'ADMIN' && (
        <Section>
          <PendingSalesRequestsSection requests={salesRequests} />
        </Section>
      )}

      <Section>
        <SectionHeading icon={Route}>{t.controlTower.sectionPipeline}</SectionHeading>
        <PipelineFlow data={stationLoad} activeStation={activeStation} onSelectStation={setActiveStation} />
      </Section>

      <Section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>{t.controlTower.sectionStatusDist}</CardTitle>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {statusChartData.map((entry) => (
                    <radialGradient key={entry.status} id={`grad-${entry.status}`} cx="35%" cy="35%" r="70%">
                      <stop offset="0%" stopColor={STATUS_COLORS[entry.status] ?? '#8a94a3'} stopOpacity={1} />
                      <stop offset="100%" stopColor={STATUS_COLORS[entry.status] ?? '#8a94a3'} stopOpacity={0.65} />
                    </radialGradient>
                  ))}
                </defs>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  cornerRadius={4}
                  animationDuration={700}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={`url(#grad-${entry.status})`} stroke="var(--color-forge-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-forge-steel">
            {statusChartData.map((entry) => (
              <li key={entry.status} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                {entry.name} ({entry.value})
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{t.controlTower.sectionLeadTime}</CardTitle>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeData} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="grad-leadtime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b1a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#ff6b1a" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b33" vertical={false} />
                <XAxis dataKey="station" tick={{ fill: '#8a94a3', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={55} />
                <YAxis tick={{ fill: '#8a94a3', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: '#1b1f26' }}
                  formatter={(value) => [`${value} h`, t.controlTower.tooltipLeadTime]}
                />
                <Bar dataKey="horas" fill="url(#grad-leadtime)" radius={[6, 6, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section>
        <SectionHeading icon={OctagonX}>{t.controlTower.sectionReports}</SectionHeading>
        {delayChartData.length === 0 ? (
          <Card>
            <p className="py-4 text-center text-sm text-forge-steel">{t.controlTower.reportsEmpty}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={delayChartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={3} cornerRadius={4} animationDuration={700}>
                      {delayChartData.map((entry) => (
                        <Cell key={entry.reason} fill={DELAY_REASON_COLORS[entry.reason] ?? '#8a94a3'} stroke="var(--color-forge-surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-forge-steel">
                {delayChartData.map((entry) => (
                  <li key={entry.reason} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ background: DELAY_REASON_COLORS[entry.reason] }} />
                    {entry.name} ({entry.value})
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardTitle>{t.controlTower.currentlyStopped}</CardTitle>
              <ul className="mt-3 space-y-2">
                {stoppedOrders.length === 0 && <li className="text-sm text-forge-steel">{t.controlTower.reportsEmpty}</li>}
                {stoppedOrders.map((order) => {
                  const lastHold = [...order.history].reverse().find((e) => e.type === 'HOLD');
                  return (
                    <li key={order.id} className="rounded-lg border border-forge-stopped/30 bg-forge-stopped/5 p-2.5">
                      <p className="text-sm font-medium text-slate-100">{order.id} · {order.projectName}</p>
                      {lastHold?.delayReason && (
                        <p className="text-xs text-forge-stopped">{formatDelayReason(lastHold.delayReason, language)}</p>
                      )}
                      <p className="text-[11px] text-forge-steel">{formatRelativeTime(order.lastMovementAt, language)}</p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading icon={Truck} count={shipments.length}>{t.controlTower.sectionDispatches}</SectionHeading>
        <div className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {shipments.slice(0, 8).map((order) => {
            const isDelivered = order.status === 'COMPLETADO';
            return (
              <motion.button
                key={order.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedOrderId(order.id)}
                className="w-56 shrink-0 snap-start rounded-2xl border border-forge-border bg-gradient-to-b from-forge-surface-2 to-forge-surface p-3.5 text-left transition-colors hover:border-forge-accent/30"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn(
                    'flex size-8 items-center justify-center rounded-full',
                    isDelivered ? 'bg-forge-ok/15' : 'bg-forge-accent/15',
                  )}>
                    <PackageCheck className={cn('size-4', isDelivered ? 'text-forge-ok' : 'text-forge-accent')} />
                  </span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    isDelivered ? 'bg-forge-ok/10 text-forge-ok' : 'bg-forge-accent/10 text-forge-accent',
                  )}>
                    {isDelivered ? t.controlTower.delivered : t.controlTower.inDispatch}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-slate-100">{order.projectName}</p>
                <p className="truncate text-xs text-forge-steel">{order.id} · {order.clientName}</p>
              </motion.button>
            );
          })}
          {shipments.length === 0 && <p className="py-3 text-xs text-forge-steel">{t.controlTower.noActiveDispatches}</p>}
        </div>
      </Section>

      <Section>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionHeading icon={ListChecks} count={visibleOrders.length}>
            {activeStation ? t.controlTower.sectionInStation(formatStation(activeStation, language)) : t.controlTower.sectionAllActive}
          </SectionHeading>
          {activeStation && (
            <button
              type="button"
              onClick={() => setActiveStation(null)}
              className="text-[11px] font-medium text-forge-accent hover:underline"
            >
              {t.controlTower.removeFilter}
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {visibleOrders.map((order) => (
            <OrderCardTouch key={order.id} order={order} onOpen={(o) => setSelectedOrderId(o.id)} />
          ))}
        </div>
      </Section>

      <OrderDetailSheet order={selectedOrder} onClose={() => setSelectedOrderId(null)} />
    </motion.div>
  );
}

type KpiTone = 'ok' | 'stopped' | 'accent' | 'neutral';

const KPI_TONE_CLASSES: Record<KpiTone, { icon: string; badge: string }> = {
  ok: { icon: 'text-forge-ok', badge: 'bg-forge-ok/10' },
  stopped: { icon: 'text-forge-stopped', badge: 'bg-forge-stopped/10' },
  accent: { icon: 'text-forge-accent', badge: 'bg-forge-accent/10' },
  neutral: { icon: 'text-forge-steel', badge: 'bg-forge-surface-2' },
};

function MiniKpi({ icon: Icon, label, value, tone }: { icon: typeof Gauge; label: string; value: string; tone: KpiTone }) {
  const { icon, badge } = KPI_TONE_CLASSES[tone];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2.5 rounded-xl border border-forge-border bg-forge-surface-2 px-3 py-3"
    >
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', badge)}>
        <Icon className={cn('size-4', icon)} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight text-slate-100">{value}</p>
        <p className="text-[10px] text-forge-steel">{label}</p>
      </div>
    </motion.div>
  );
}
