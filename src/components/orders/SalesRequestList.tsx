import type { SalesRequest, SalesRequestStatus } from '../../types/order';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatDate, formatUF } from '../../utils/formatters';
import { OrderPriorityBadge } from './OrderPriorityBadge';

const STATUS_TONE: Record<SalesRequestStatus, 'ok' | 'warn' | 'stopped'> = {
  PENDIENTE: 'warn',
  CARGADA: 'ok',
  RECHAZADA: 'stopped',
};

/** Lista de las solicitudes de venta que el Vendedor ya envió a Administración, con su estado. */
export function SalesRequestList({ requests }: { requests: SalesRequest[] }) {
  const { t, language } = useUiPrefs();

  const STATUS_LABEL: Record<SalesRequestStatus, string> = {
    PENDIENTE: t.salesRequest.statusPending,
    CARGADA: t.salesRequest.statusLoaded,
    RECHAZADA: t.salesRequest.statusRejected,
  };

  return (
    <Card>
      <CardTitle>{t.salesRequest.myRequestsTitle(requests.length)}</CardTitle>
      {requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-forge-steel">{t.salesRequest.noRequests}</p>
      ) : (
        <ul className="mt-3 divide-y divide-forge-border/60">
          {requests.map((request) => (
            <li key={request.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{request.projectName}</p>
                <Badge tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-forge-steel">{request.clientName} · {formatUF(request.estimatedAmountUF, language)}</span>
                <OrderPriorityBadge priority={request.priority} />
              </div>
              <p className="mt-1 text-[11px] text-forge-steel">{t.salesRequest.requestedAt}: {formatDate(request.requestedAt, language)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
