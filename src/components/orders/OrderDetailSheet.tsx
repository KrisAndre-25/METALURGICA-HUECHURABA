import { useState } from 'react';
import { ArrowRight, UserCog } from 'lucide-react';
import type { WorkOrder } from '../../types/order';
import { STATIONS } from '../../types/order';
import { formatDate, formatEventType, formatRelativeTime, formatStation, formatTons } from '../../utils/formatters';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Select, Textarea } from '../ui/Input';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderPriorityBadge } from './OrderPriorityBadge';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';
import { mockDataService } from '../../services/mockDataService';

const OPERATOR_NAMES = mockDataService.getUsers().filter((u) => u.role === 'OPERATOR' && u.active).map((u) => u.name);

export function OrderDetailSheet({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  const { user } = useAuth();
  const { advanceStation, addNote, reassignOperator } = useOrders();
  const { showToast } = useToast();
  const [note, setNote] = useState('');
  const [reassignTo, setReassignTo] = useState('');

  const canOperate = user?.role === 'ADMIN' || user?.role === 'OPERATOR';
  const isLastStation = order?.currentStation === STATIONS[STATIONS.length - 1];
  const isDone = order?.status === 'COMPLETADO';

  const handleReassign = () => {
    if (!user || !order || !reassignTo) return;
    reassignOperator(order.id, reassignTo, user.name);
    showToast(`${order.id} reasignada a ${reassignTo}.`);
    setReassignTo('');
  };

  const handleAdvance = () => {
    if (!user || !order) return;
    const nextStation = STATIONS[STATIONS.indexOf(order.currentStation) + 1];
    advanceStation(order.id, user.name, note.trim() || undefined);
    showToast(
      isLastStation
        ? `${order.id} despachada — marcada como COMPLETADO.`
        : `${order.id} avanzó de ${formatStation(order.currentStation)} a ${formatStation(nextStation)}.`,
    );
    setNote('');
    onClose();
  };

  const handleAddNote = () => {
    if (!user || !order || !note.trim()) return;
    addNote(order.id, user.name, note.trim());
    showToast('Nota registrada.');
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
            <div><dt className="text-xs text-forge-steel">Cliente</dt><dd>{order.clientName}</dd></div>
            <div><dt className="text-xs text-forge-steel">Operario actual</dt><dd>{order.assignedOperator}</dd></div>
            <div><dt className="text-xs text-forge-steel">Estructura</dt><dd>{order.productSpecs.structureType}</dd></div>
            <div><dt className="text-xs text-forge-steel">Dimensiones</dt><dd>{order.productSpecs.dimensions}</dd></div>
            <div><dt className="text-xs text-forge-steel">Peso</dt><dd>{formatTons(order.productSpecs.weightTons)}</dd></div>
            <div><dt className="text-xs text-forge-steel">Pintura</dt><dd>{order.productSpecs.paintSpecification}</dd></div>
            <div><dt className="text-xs text-forge-steel">Fecha comprometida</dt><dd>{formatDate(order.promisedDate)}</dd></div>
            <div><dt className="text-xs text-forge-steel">Último movimiento</dt><dd>{formatRelativeTime(order.lastMovementAt)}</dd></div>
          </dl>

          {canOperate && !isDone && (
            <div className="mb-5 space-y-2 rounded-xl border border-forge-border bg-forge-surface-2 p-3">
              <Textarea label="Nota (opcional)" placeholder="Ej: esperando pintura epóxica del proveedor…" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="secondary" size="md" fullWidth onClick={handleAddNote} disabled={!note.trim()}>
                  Solo guardar nota
                </Button>
                <Button variant="primary" size="md" fullWidth icon={<ArrowRight className="size-4" />} onClick={handleAdvance}>
                  {isLastStation ? 'Marcar despachada' : `A ${formatStation(STATIONS[STATIONS.indexOf(order.currentStation) + 1])}`}
                </Button>
              </div>
            </div>
          )}

          {user?.role === 'ADMIN' && !isDone && (
            <div className="mb-5 flex items-end gap-2 rounded-xl border border-forge-border bg-forge-surface-2 p-3">
              <div className="flex-1">
                <Select label="Reasignar operario" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                  <option value="">Seleccionar…</option>
                  {OPERATOR_NAMES.filter((n) => n !== order.assignedOperator).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </Select>
              </div>
              <Button variant="secondary" size="md" icon={<UserCog className="size-4" />} onClick={handleReassign} disabled={!reassignTo}>
                Asignar
              </Button>
            </div>
          )}

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">Historial de trazabilidad</h3>
          <ol className="space-y-3 border-l border-forge-border pl-4">
            {[...order.history].reverse().map((event) => (
              <li key={event.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-forge-accent" />
                <p className="font-medium">{formatEventType(event.type)} {formatStation(event.station)}</p>
                <p className="text-xs text-forge-steel">{event.actor} · {formatRelativeTime(event.timestamp)}</p>
                {event.note && <p className="text-xs text-forge-warn">{event.note}</p>}
              </li>
            ))}
          </ol>
        </>
      )}
    </BottomSheet>
  );
}
