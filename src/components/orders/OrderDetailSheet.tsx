import { useState } from 'react';
import { ArrowRight, OctagonX, PlayCircle, UserCog } from 'lucide-react';
import type { WorkOrder } from '../../types/order';
import { STATIONS } from '../../types/order';
import { formatDate, formatEventType, formatRelativeTime, formatRole, formatStation, formatTons } from '../../utils/formatters';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Select, Textarea } from '../ui/Input';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { RootCauseModal } from './RootCauseModal';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';

export function OrderDetailSheet({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  const { user, users } = useAuth();
  const { t, language } = useUiPrefs();
  const { advanceStation, addNote, reassignOperator } = useOrders();
  const { showToast } = useToast();
  const [note, setNote] = useState('');
  const [reassignTo, setReassignTo] = useState('');
  const [rootCauseOpen, setRootCauseOpen] = useState(false);

  const operatorNames = users.filter((u) => u.role === 'OPERATOR' && u.active).map((u) => u.name);

  const canOperate = user?.role === 'ADMIN' || user?.role === 'OPERATOR';
  const isLastStation = order?.currentStation === STATIONS[STATIONS.length - 1];
  const isDone = order?.status === 'COMPLETADO';
  const isStopped = order?.status === 'DETENIDO';

  const handleReassign = () => {
    if (!user || !order || !reassignTo) return;
    reassignOperator(order.id, reassignTo, user.name, user.role);
    showToast(t.orders.detailSheet.toastReassigned(order.id, reassignTo));
    setReassignTo('');
  };

  const handleAdvance = () => {
    if (!user || !order) return;
    const nextStation = STATIONS[STATIONS.indexOf(order.currentStation) + 1];
    advanceStation(order.id, user.name, user.role, note.trim() || undefined);
    showToast(
      isLastStation
        ? t.orders.detailSheet.toastDispatched(order.id)
        : t.orders.detailSheet.toastAdvanced(order.id, formatStation(order.currentStation, language), formatStation(nextStation, language)),
    );
    setNote('');
    onClose();
  };

  const handleAddNote = () => {
    if (!user || !order || !note.trim()) return;
    // `addNote` solo toca el historial de `order.id` dentro de OrderContext — nunca otra OT.
    addNote(order.id, user.name, user.role, note.trim());
    showToast(t.orders.detailSheet.toastNoteAdded(order.id));
    setNote('');
  };

  return (
    <BottomSheet open={order !== null} onClose={onClose} title={order?.projectName} subtitle={order ? `${order.id} · ${order.purchaseOrderId}` : undefined}>
      {order && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <OrderPriorityBadge priority={order.priority} />
          </div>

          <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.client}</dt><dd>{order.clientName}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.currentOperator}</dt><dd>{order.assignedOperator}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.structure}</dt><dd>{order.productSpecs.structureType}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.dimensions}</dt><dd>{order.productSpecs.dimensions}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.weight}</dt><dd>{formatTons(order.productSpecs.weightTons)}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.paint}</dt><dd>{order.productSpecs.paintSpecification}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.promisedDate}</dt><dd>{formatDate(order.promisedDate, language)}</dd></div>
            <div><dt className="text-xs text-forge-steel">{t.orders.detailSheet.lastMovement}</dt><dd>{formatRelativeTime(order.lastMovementAt, language)}</dd></div>
          </dl>

          {canOperate && !isDone && (
            <div className="mb-3">
              {isStopped ? (
                <Button variant="secondary" fullWidth size="lg" icon={<PlayCircle className="size-4" />} onClick={() => setRootCauseOpen(true)}>
                  {t.orders.detailSheet.resumeButton}
                </Button>
              ) : (
                <Button variant="danger" fullWidth size="lg" icon={<OctagonX className="size-4" />} onClick={() => setRootCauseOpen(true)}>
                  {t.orders.detailSheet.holdButton}
                </Button>
              )}
            </div>
          )}

          {canOperate && !isDone && !isStopped && (
            <div className="mb-5 space-y-2 rounded-xl border border-forge-border bg-forge-surface-2 p-3">
              <Textarea
                label={t.orders.detailSheet.noteLabel(order.id)}
                placeholder={t.orders.detailSheet.notePlaceholder}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="md" fullWidth onClick={handleAddNote} disabled={!note.trim()}>
                  {t.orders.detailSheet.saveNote(order.id)}
                </Button>
                <Button variant="primary" size="md" fullWidth icon={<ArrowRight className="size-4" />} onClick={handleAdvance}>
                  {isLastStation ? t.orders.detailSheet.markDispatched : t.orders.detailSheet.advanceTo(formatStation(STATIONS[STATIONS.indexOf(order.currentStation) + 1], language))}
                </Button>
              </div>
            </div>
          )}

          {user?.role === 'ADMIN' && !isDone && (
            <div className="mb-5 flex items-end gap-2 rounded-xl border border-forge-border bg-forge-surface-2 p-3">
              <div className="flex-1">
                <Select label={t.orders.detailSheet.reassignLabel} value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                  <option value="">{t.orders.detailSheet.selectPlaceholder}</option>
                  {operatorNames.filter((n) => n !== order.assignedOperator).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              </div>
              <Button variant="secondary" size="md" icon={<UserCog className="size-4" />} onClick={handleReassign} disabled={!reassignTo}>
                {t.orders.detailSheet.assign}
              </Button>
            </div>
          )}

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">
            {t.orders.detailSheet.historyTitle(order.id)}
          </h3>
          <ol className="space-y-3 border-l border-forge-border pl-4">
            {[...order.history].reverse().map((event) => (
              <li key={event.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-forge-accent" />
                <p className="font-medium">{formatEventType(event.type, language)} {formatStation(event.station, language)}</p>
                <p className="text-xs text-forge-steel">
                  {event.actor} <span className="text-forge-steel/70">· {formatRole(event.actorRole, language)}</span> · {formatRelativeTime(event.timestamp, language)}
                </p>
                {event.note && <p className="text-xs text-forge-warn">{event.note}</p>}
              </li>
            ))}
          </ol>

          <RootCauseModal order={order} open={rootCauseOpen} onClose={() => setRootCauseOpen(false)} />
        </>
      )}
    </BottomSheet>
  );
}
