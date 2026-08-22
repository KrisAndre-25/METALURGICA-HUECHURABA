import { useOrders } from '../../hooks/useOrders';
import { StationChecklist } from './StationChecklist';

export function ChecklistPage() {
  const { orders } = useOrders();
  const active = orders.filter((o) => o.status !== 'DETENIDO');

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {active.map((order) => (
        <StationChecklist key={order.id} order={order} />
      ))}
    </div>
  );
}
