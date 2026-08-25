import { Badge } from '../ui/Badge';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatPriority } from '../../utils/formatters';
import type { Priority } from '../../types/order';

const TONE: Record<Priority, 'ok' | 'warn' | 'risk' | 'stopped'> = {
  BAJA: 'ok',
  NORMAL: 'warn',
  ALTA: 'risk',
  URGENTE: 'stopped',
};

export function OrderPriorityBadge({ priority }: { priority: Priority }) {
  const { language } = useUiPrefs();
  return <Badge tone={TONE[priority]}>{formatPriority(priority, language)}</Badge>;
}
