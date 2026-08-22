import { AlertTriangle, CheckCircle2, Clock, OctagonX } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatStatus } from '../../utils/formatters';
import type { OrderStatus } from '../../types/order';

const CONFIG = {
  EN_TIEMPO: { tone: 'ok', icon: CheckCircle2 },
  EN_RIESGO: { tone: 'warn', icon: Clock },
  ATRASADO: { tone: 'risk', icon: AlertTriangle },
  DETENIDO: { tone: 'stopped', icon: OctagonX },
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { tone, icon: Icon } = CONFIG[status];
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5" />
      {formatStatus(status)}
    </Badge>
  );
}
