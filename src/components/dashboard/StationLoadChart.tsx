import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardTitle } from '../ui/Card';
import type { StationLoad } from '../../types/kpi';
import { formatStation } from '../../utils/formatters';

export function StationLoadChart({ data }: { data: StationLoad[] }) {
  const chartData = data.map((d) => ({ station: formatStation(d.station), OTs: d.orderCount }));

  return (
    <Card>
      <CardTitle>Carga de OT por estación</CardTitle>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262b33" vertical={false} />
            <XAxis dataKey="station" tick={{ fill: '#8a94a3', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#8a94a3', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#14171c', border: '1px solid #262b33', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: '#1b1f26' }}
            />
            <Bar dataKey="OTs" fill="#ff6b1a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
