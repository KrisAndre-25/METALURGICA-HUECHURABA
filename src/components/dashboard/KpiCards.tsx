import { AlertOctagon, Gauge, PackageCheck, Timer } from 'lucide-react';
import { Card } from '../ui/Card';
import type { PlantKpis } from '../../types/kpi';

export function KpiCards({ kpis }: { kpis: PlantKpis }) {
  const items = [
    { label: 'OT activas', value: kpis.totalActiveOrders, icon: PackageCheck, tone: 'text-forge-accent' },
    { label: '% en tiempo', value: `${kpis.onTimePercentage}%`, icon: Gauge, tone: 'text-forge-ok' },
    { label: 'Ciclo promedio', value: `${kpis.averageCycleTimeDays} d`, icon: Timer, tone: 'text-forge-steel' },
    { label: 'OT detenidas', value: kpis.stoppedOrders, icon: AlertOctagon, tone: 'text-forge-stopped' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label} className="flex items-center gap-4">
          <Icon className={`size-8 ${tone}`} />
          <div>
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-forge-steel">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
