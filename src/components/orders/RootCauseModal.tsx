import { useState } from 'react';
import { OctagonX, PlayCircle, Users } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';
import { calculateStationLoad } from '../../utils/kpiCalculators';
import { formatDelayReason, formatHours, formatStation, hoursSince } from '../../utils/formatters';
import { DELAY_REASONS, type CorrectiveAction, type DelayReason, type WorkOrder } from '../../types/order';
import { cn } from '../ui/cn';

interface RootCauseModalProps {
  order: WorkOrder | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Análisis de Causa Raíz para paradas: sustituye la nota libre por un registro
 * estructurado. En modo Detener pide uno de los 5 motivos predefinidos; en modo
 * Reanudar exige describir la Acción Correctiva aplicada (obligatoria) y ofrece,
 * como ayuda opcional, balancear la línea reasignando un operario disponible.
 */
export function RootCauseModal({ order, open, onClose }: RootCauseModalProps) {
  const { user, users, updateWorker } = useAuth();
  const { t, language } = useUiPrefs();
  const { allOrders, holdOrder, resumeOrder } = useOrders();
  const { showToast } = useToast();
  const [reason, setReason] = useState<DelayReason | null>(null);
  const [note, setNote] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState<CorrectiveAction | null>(null);

  if (!order || !user) return null;

  const isResuming = order.status === 'DETENIDO';
  const lastHold = [...order.history].reverse().find((e) => e.type === 'HOLD');
  const elapsedDowntimeHours = lastHold ? hoursSince(lastHold.timestamp) : 0;

  const stationLoad = calculateStationLoad(allOrders);
  const bottleneck = [...stationLoad].sort((a, b) => b.orderCount - a.orderCount)[0];
  const bottleneckStation = bottleneck && bottleneck.orderCount > 0 ? bottleneck.station : null;
  const availableOperator = bottleneckStation
    ? users.find((u) => u.role === 'OPERATOR' && u.active && u.station !== bottleneckStation)
    : undefined;

  const reset = () => {
    setReason(null);
    setNote('');
    setCorrectiveAction(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleHold = () => {
    if (!reason) return;
    holdOrder(order.id, user.name, user.role, reason, note.trim() || undefined);
    showToast(t.rootCause.toastHeld(order.id));
    handleClose();
  };

  const handleResume = () => {
    if (correctiveAction === 'BALANCEAR_LINEA' && bottleneckStation && availableOperator) {
      updateWorker(availableOperator.id, { station: bottleneckStation });
      showToast(t.rootCause.toastBalanced(availableOperator.name, formatStation(bottleneckStation, language)));
    }
    resumeOrder(order.id, user.name, user.role, correctiveAction ?? undefined, note.trim() || undefined);
    showToast(t.rootCause.toastResumed(order.id));
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={isResuming ? t.rootCause.resumeTitle : t.rootCause.holdTitle}>
      {isResuming ? (
        <div className="space-y-4">
          <p className="text-sm text-forge-steel">{t.rootCause.resumeSubtitle(order.id)}</p>

          {lastHold?.delayReason && (
            <div className="rounded-xl border border-forge-border bg-forge-surface-2 p-3">
              <p className="text-xs text-forge-steel">{t.rootCause.originalReason}</p>
              <p className="text-sm font-medium text-slate-100">{formatDelayReason(lastHold.delayReason, language)}</p>
              {lastHold.note && <p className="mt-1 text-xs text-forge-warn">{lastHold.note}</p>}
              <p className="mt-2 text-xs font-semibold text-forge-warn">{t.rootCause.downtimeSoFar(formatHours(elapsedDowntimeHours, language))}</p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-forge-steel">{t.rootCause.correctiveActionLabel}</p>
            <button
              type="button"
              onClick={() => setCorrectiveAction(correctiveAction === 'BALANCEAR_LINEA' ? null : 'BALANCEAR_LINEA')}
              disabled={!bottleneckStation || !availableOperator}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                correctiveAction === 'BALANCEAR_LINEA' ? 'border-forge-accent bg-forge-accent/10' : 'border-forge-border hover:border-forge-accent/40',
              )}
            >
              <Users className="mt-0.5 size-4 shrink-0 text-forge-accent" />
              <span>
                <span className="block text-sm font-medium text-slate-100">{t.rootCause.balanceLine}</span>
                <span className="block text-xs text-forge-steel">
                  {bottleneckStation && availableOperator
                    ? t.rootCause.balanceLineHint(formatStation(bottleneckStation, language))
                    : t.rootCause.balanceLineNoOperator}
                </span>
              </span>
            </button>
          </div>

          <Textarea
            label={t.rootCause.correctiveNoteLabel}
            placeholder={t.rootCause.correctiveNotePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button fullWidth size="lg" icon={<PlayCircle className="size-4" />} onClick={handleResume} disabled={!note.trim()}>
            {t.rootCause.confirmResume}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-forge-steel">{t.rootCause.holdSubtitle(order.id)}</p>

          <div>
            <p className="mb-2 text-xs font-medium text-forge-steel">{t.rootCause.reasonLabel}</p>
            <div className="space-y-2">
              {DELAY_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left text-sm font-medium transition-colors',
                    reason === r ? 'border-forge-accent bg-forge-accent/10 text-slate-100' : 'border-forge-border text-forge-steel hover:border-forge-accent/40',
                  )}
                >
                  {formatDelayReason(r, language)}
                </button>
              ))}
            </div>
          </div>

          <Textarea label={t.rootCause.noteLabel} placeholder={t.rootCause.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />

          <Button variant="danger" fullWidth size="lg" icon={<OctagonX className="size-4" />} onClick={handleHold} disabled={!reason}>
            {t.rootCause.confirmHold}
          </Button>
        </div>
      )}
    </Modal>
  );
}
