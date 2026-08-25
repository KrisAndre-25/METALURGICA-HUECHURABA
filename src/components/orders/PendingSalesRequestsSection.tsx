import { useState } from 'react';
import { FileInput } from 'lucide-react';
import type { SalesRequest } from '../../types/order';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatUF } from '../../utils/formatters';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { LoadPurchaseOrderSheet } from './LoadPurchaseOrderSheet';

/** ADMIN-only: solicitudes de venta pendientes de que Administración cargue la OC. */
export function PendingSalesRequestsSection({ requests }: { requests: SalesRequest[] }) {
  const { t, language } = useUiPrefs();
  const [selected, setSelected] = useState<SalesRequest | null>(null);
  const pending = requests.filter((r) => r.status === 'PENDIENTE');

  if (pending.length === 0) return null;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle>{t.controlTower.sectionPendingSales}</CardTitle>
        <span className="text-xs text-forge-steel">{pending.length}</span>
      </div>
      <ul className="divide-y divide-forge-border/60">
        {pending.map((request) => (
          <li key={request.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{request.projectName}</p>
                <OrderPriorityBadge priority={request.priority} />
              </div>
              <p className="truncate text-xs text-forge-steel">
                {request.clientName} · {formatUF(request.estimatedAmountUF, language)} · {t.salesRequest.requestedBy}: {request.requestedBy}
              </p>
            </div>
            <Button size="sm" icon={<FileInput className="size-3.5" />} onClick={() => setSelected(request)}>
              {t.controlTower.loadOc}
            </Button>
          </li>
        ))}
      </ul>

      <LoadPurchaseOrderSheet request={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
