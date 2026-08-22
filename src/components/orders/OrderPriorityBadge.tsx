import { Badge } from '../ui/Badge';
import type { Priority } from '../../types/order';

const TONE: Record<Priority, 'ok' | 'warn' | 'risk' | 'stopped'> = {
  BAJA: 'ok',
  MEDIA: 'warn',
  ALTA: 'risk',
  URGENTE: 'stopped',
};

export function OrderPriorityBadge({ priority }: { priority: Priority }) {
  return <Badge tone={TONE[priority]}>{priority}</Badge>;
}
