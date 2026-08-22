import { useMemo } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { calculatePlantKpis, calculateStationLoad, summarizeByStatus } from '../../utils/kpiCalculators';
import { KpiCards } from './KpiCards';
import { StatusChart } from './StatusChart';
import { StationLoadChart } from './StationLoadChart';
import { useHealthScores } from '../../hooks/useHealthScore';
import { Card, CardTitle } from '../ui/Card';
import { formatDate } from '../../utils/formatters';

export function DashboardPage() {
  const { allOrders } = useOrders();

  const kpis = useMemo(() => calculatePlantKpis(allOrders), [allOrders]);
  const statusSummary = useMemo(() => summarizeByStatus(allOrders), [allOrders]);
  const stationLoad = useMemo(() => calculateStationLoad(allOrders), [allOrders]);
  const healthScores = useHealthScores(allOrders);
  const critical = healthScores.slice(0, 5);

  return (
    <div className="space-y-6">
      <KpiCards kpis={kpis} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusChart data={statusSummary} />
        <StationLoadChart data={stationLoad} />
      </div>
      <Card>
        <CardTitle>OT más críticas</CardTitle>
        <ul className="mt-3 divide-y divide-forge-border/60">
          {critical.map((h) => {
            const order = allOrders.find((o) => o.id === h.orderId);
            if (!order) return null;
            return (
              <li key={h.orderId} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{order.projectName}</p>
                  <p className="text-xs text-forge-steel">{h.mainRiskFactor ?? 'Sin riesgo relevante'} · comprometida {formatDate(order.promisedDate)}</p>
                </div>
                <span className="shrink-0 text-lg font-bold text-forge-accent">{h.score}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
