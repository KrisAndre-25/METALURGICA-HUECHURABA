import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardTitle } from '../ui/Card';
import type { StatusSummary } from '../../types/kpi';
import { formatStatus } from '../../utils/formatters';

const COLORS: Record<string, string> = {
  EN_TIEMPO: '#22c55e',
  EN_RIESGO: '#eab308',
  ATRASADO: '#f97316',
  DETENIDO: '#ef4444',
};

export function StatusChart({ data }: { data: StatusSummary[] }) {
  const chartData = data.map((d) => ({ name: formatStatus(d.status), status: d.status, value: d.count }));

  return (
    <Card>
      <CardTitle>Distribución por estado</CardTitle>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.status} fill={COLORS[entry.status] ?? '#8a94a3'} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-forge-steel">
        {chartData.map((entry) => (
          <li key={entry.status} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: COLORS[entry.status] }} />
            {entry.name} ({entry.value})
          </li>
        ))}
      </ul>
    </Card>
  );
}
