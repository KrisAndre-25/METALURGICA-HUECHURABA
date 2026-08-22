import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertOctagon, Banknote, Gauge, PackageCheck } from 'lucide-react';
import type { Station, WorkOrder } from '../../types/order';
import { useOrders } from '../../hooks/useOrders';
import { useDiagnosticEngine } from '../../hooks/useDiagnosticEngine';
import { mockPurchaseOrders } from '../../data/mockPurchaseOrders';
import { calculatePlantKpis, calculateStationLoad, summarizeByStatus } from '../../utils/kpiCalculators';
import { formatStation, formatStatus, formatUF } from '../../utils/formatters';
import { HealthScoreGauge } from './HealthScoreGauge';
import { PipelineFlow } from './PipelineFlow';
import { DiagnosticBanner } from './DiagnosticBanner';
import { Card, CardTitle } from '../ui/Card';
import { OrderCardTouch } from '../orders/OrderCardTouch';
import { OrderDetailSheet } from '../orders/OrderDetailSheet';

const STATUS_COLORS: Record<string, string> = {
  EN_TIEMPO: '#22c55e',
  EN_RIESGO: '#eab308',
  ATRASADO: '#f97316',
  DETENIDO: '#ef4444',
  COMPLETADO: '#8a94a3',
};

export function ControlTower() {
  const { allOrders } = useOrders();
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  const insights = useDiagnosticEngine(allOrders);
  const kpis = useMemo(() => calculatePlantKpis(allOrders, mockPurchaseOrders), [allOrders]);
  const stationLoad = useMemo(() => calculateStationLoad(allOrders), [allOrders]);
  const statusSummary = useMemo(
    () => summarizeByStatus(allOrders.filter((o) => o.status !== 'COMPLETADO')),
    [allOrders],
  );

  const visibleOrders = useMemo(() => {
    const active = allOrders.filter((o) => o.status !== 'COMPLETADO');
    return activeStation ? active.filter((o) => o.currentStation === activeStation) : active;
  }, [allOrders, activeStation]);

  const statusChartData = statusSummary.map((s) => ({ name: formatStatus(s.status), status: s.status, value: s.count }));
  const leadTimeData = stationLoad.map((s) => ({ station: formatStation(s.station), horas: Math.round(s.averageLeadTimeHours) }));

  return (
    <div className="space-y-5 pb-24">
      <Card className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
        <HealthScoreGauge score={kpis.plantHealthScore} />
        <div className="grid w-full grid-cols-2 gap-3 sm:w-auto">
          <MiniKpi icon={PackageCheck} label="OTD" value={`${kpis.onTimeDeliveryPercentage}%`} />
          <MiniKpi icon={Gauge} label="Ciclo prom." value={`${kpis.averageCycleTimeDays} d`} />
          <MiniKpi icon={Banknote} label="Monto activo" value={formatUF(kpis.activeAmountUF)} />
          <MiniKpi icon={AlertOctagon} label="Detenidas" value={String(kpis.stoppedOrders)} tone="text-forge-stopped" />
        </div>
      </Card>

      <DiagnosticBanner insights={insights} />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">Pipeline de producción</h3>
        <PipelineFlow data={stationLoad} activeStation={activeStation} onSelectStation={setActiveStation} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Distribución por estado (OTD)</CardTitle>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#8a94a3'} stroke="none" />
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
          <CardTitle>Lead time promedio por estación</CardTitle>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadTimeData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b33" vertical={false} />
                <XAxis dataKey="station" tick={{ fill: '#8a94a3', fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={55} />
                <YAxis tick={{ fill: '#8a94a3', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: '#1b1f26' }}
                  formatter={(value) => [`${value} h`, 'Lead time']}
                />
                <Bar dataKey="horas" fill="#ff6b1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">
          {activeStation ? `OTs en ${formatStation(activeStation)}` : 'Todas las OTs activas'} ({visibleOrders.length})
        </h3>
        <div className="space-y-2.5">
          {visibleOrders.map((order) => (
            <OrderCardTouch key={order.id} order={order} onOpen={setSelectedOrder} />
          ))}
        </div>
      </div>

      <OrderDetailSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

function MiniKpi({ icon: Icon, label, value, tone }: { icon: typeof Gauge; label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-forge-border bg-forge-surface-2 px-3 py-2.5">
      <Icon className={`size-5 shrink-0 ${tone ?? 'text-forge-accent'}`} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold leading-tight">{value}</p>
        <p className="text-[10px] text-forge-steel">{label}</p>
      </div>
    </div>
  );
}
