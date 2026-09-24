import { useState, type FormEvent } from 'react';
import { ClipboardList, Inbox, PencilLine, XCircle } from 'lucide-react';
import type { SalesRequest } from '../../types/order';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';
import { CountBadge } from '../ui/CountBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';
import { formatRelativeTime, formatUF } from '../../utils/formatters';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { ReviewRequestModal } from './ReviewRequestModal';

/**
 * Vista ADMIN "Solicitudes Pendientes": bandeja de las Solicitudes de Venta que
 * los Vendedores ingresaron y que todavía no son OT. Se aprueban (→ OT activa en
 * la Torre de Control) o se rechazan con motivo; en ambos casos salen de la lista.
 */
export function SolicitudesPendientes() {
  const { salesRequests } = useOrders();
  const { t } = useUiPrefs();
  const tr = t.pendingRequests;
  const [reviewing, setReviewing] = useState<SalesRequest | null>(null);
  const [rejecting, setRejecting] = useState<SalesRequest | null>(null);

  const pending = salesRequests
    .filter((r) => r.status === 'PENDIENTE')
    .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());

  return (
    <div className="space-y-4 pb-24">
      <div className="hidden sm:block">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-100">
          <ClipboardList className="size-5 text-forge-accent" />
          {tr.title}
          {pending.length > 0 && <CountBadge count={pending.length} />}
        </h1>
        <p className="text-sm text-forge-steel">{tr.subtitle}</p>
      </div>

      {pending.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center">
          <Inbox className="size-8 text-forge-steel/60" />
          <p className="text-sm text-forge-steel">{tr.empty}</p>
        </Card>
      ) : (
        <>
          <RequestsTable requests={pending} onReview={setReviewing} onReject={setRejecting} />
          <RequestsCards requests={pending} onReview={setReviewing} onReject={setRejecting} />
        </>
      )}

      <ReviewRequestModal request={reviewing} onClose={() => setReviewing(null)} />
      <RejectRequestModal request={rejecting} onClose={() => setRejecting(null)} />
    </div>
  );
}

interface ListProps {
  requests: SalesRequest[];
  onReview: (r: SalesRequest) => void;
  onReject: (r: SalesRequest) => void;
}

function RequestActions({ request, onReview, onReject, fullWidth }: { request: SalesRequest; fullWidth?: boolean } & Omit<ListProps, 'requests'>) {
  const { t } = useUiPrefs();
  return (
    <div className="flex gap-2">
      <Button size="sm" fullWidth={fullWidth} icon={<PencilLine className="size-3.5" />} onClick={() => onReview(request)}>
        {t.pendingRequests.review}
      </Button>
      <Button size="sm" variant="danger" fullWidth={fullWidth} icon={<XCircle className="size-3.5" />} onClick={() => onReject(request)}>
        {t.pendingRequests.reject}
      </Button>
    </div>
  );
}

/** Tabla para escritorio (`lg+`). */
function RequestsTable({ requests, onReview, onReject }: ListProps) {
  const { t, language } = useUiPrefs();
  const tr = t.pendingRequests;
  return (
    <Card noPadding className="hidden lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-forge-bg text-[11px] uppercase tracking-wide text-forge-steel">
          <tr>
            <th className="px-4 py-3 font-semibold">{tr.colFolio}</th>
            <th className="px-4 py-3 font-semibold">{tr.colSeller}</th>
            <th className="px-4 py-3 font-semibold">{tr.colClient}</th>
            <th className="px-4 py-3 font-semibold">{tr.colProject}</th>
            <th className="px-4 py-3 text-right font-semibold">{tr.colAmount}</th>
            <th className="px-4 py-3 font-semibold">{tr.colPriority}</th>
            <th className="px-4 py-3 text-right font-semibold">{tr.colActions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forge-border/60">
          {requests.map((r) => (
            <tr key={r.id} className="align-top transition-colors hover:bg-forge-surface-2/40">
              <td className="px-4 py-3">
                <p className="font-mono text-xs font-semibold text-forge-accent">{r.id}</p>
                <p className="text-[11px] text-forge-steel">{formatRelativeTime(r.requestedAt, language)}</p>
              </td>
              <td className="px-4 py-3 text-slate-200">{r.requestedBy}</td>
              <td className="px-4 py-3">
                <p className="text-slate-100">{r.clientName}</p>
                <p className="text-[11px] text-forge-steel">{r.clientRut}</p>
              </td>
              <td className="max-w-xs px-4 py-3">
                <p className="font-medium text-slate-100">{r.projectName}</p>
                <p className="line-clamp-2 text-xs text-forge-steel">{r.description}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-100">{formatUF(r.estimatedAmountUF, language)}</td>
              <td className="px-4 py-3"><OrderPriorityBadge priority={r.priority} /></td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <RequestActions request={r} onReview={onReview} onReject={onReject} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Tarjetas para mobile/tablet (bajo `lg`). */
function RequestsCards({ requests, onReview, onReject }: ListProps) {
  const { t, language } = useUiPrefs();
  return (
    <ul className="space-y-3 lg:hidden">
      {requests.map((r) => (
        <li key={r.id}>
          <Card className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-forge-accent">{r.id}</p>
                <p className="truncate text-sm font-semibold text-slate-100">{r.projectName}</p>
              </div>
              <OrderPriorityBadge priority={r.priority} />
            </div>
            <p className="line-clamp-3 text-xs text-forge-steel">{r.description}</p>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <dt className="text-forge-steel">{t.pendingRequests.colClient}</dt>
              <dd className="truncate text-right text-slate-200">{r.clientName}</dd>
              <dt className="text-forge-steel">RUT</dt>
              <dd className="text-right text-slate-200">{r.clientRut}</dd>
              <dt className="text-forge-steel">{t.pendingRequests.colSeller}</dt>
              <dd className="truncate text-right text-slate-200">{r.requestedBy}</dd>
              <dt className="text-forge-steel">{t.pendingRequests.colAmount}</dt>
              <dd className="text-right font-semibold text-slate-100">{formatUF(r.estimatedAmountUF, language)}</dd>
            </dl>
            <RequestActions request={r} onReview={onReview} onReject={onReject} fullWidth />
          </Card>
        </li>
      ))}
    </ul>
  );
}

function RejectRequestModal({ request, onClose }: { request: SalesRequest | null; onClose: () => void }) {
  const { t } = useUiPrefs();
  return (
    <Modal open={request !== null} onClose={onClose} title={request ? `${t.pendingRequests.rejectTitle} · ${request.id}` : ''}>
      {request && <RejectForm key={request.id} request={request} onDone={onClose} />}
    </Modal>
  );
}

function RejectForm({ request, onDone }: { request: SalesRequest; onDone: () => void }) {
  const { user } = useAuth();
  const { rejectSalesRequest } = useOrders();
  const { t } = useUiPrefs();
  const { showToast } = useToast();
  const tr = t.pendingRequests;
  const [reason, setReason] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reason.trim()) {
      showToast(tr.toastRejectMissing, 'error');
      return;
    }
    rejectSalesRequest(request.id, user.name, user.role, reason.trim());
    showToast(tr.toastRejected(request.id), 'info');
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-200">
        {request.projectName} <span className="text-forge-steel">· {request.clientName} · {request.requestedBy}</span>
      </p>
      <Textarea
        label={tr.rejectReason}
        placeholder={tr.rejectReasonPlaceholder}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={200}
        autoFocus
        required
      />
      <div className="flex gap-2">
        <Button variant="outline" fullWidth onClick={onDone}>{tr.cancel}</Button>
        <Button type="submit" variant="danger" fullWidth icon={<XCircle className="size-4" />}>{tr.rejectConfirm}</Button>
      </div>
    </form>
  );
}
