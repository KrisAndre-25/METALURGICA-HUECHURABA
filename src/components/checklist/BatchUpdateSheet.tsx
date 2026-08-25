import { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useToast } from '../ui/Toast';

interface BatchUpdateSheetProps {
  open: boolean;
  orderIds: string[];
  onClose: () => void;
  onDone: () => void;
}

/** Bottom sheet para aplicar la misma acción a varias OTs a la vez (ej: un mismo impedimento las afecta a todas). */
export function BatchUpdateSheet({ open, orderIds, onClose, onDone }: BatchUpdateSheetProps) {
  const { user } = useAuth();
  const { advanceStation, addNote } = useOrders();
  const { showToast } = useToast();
  const { t } = useUiPrefs();
  const [note, setNote] = useState('');
  const label = orderIds.length === 1 ? orderIds[0] : t.checklist.batch.multiLabel(orderIds.length);

  const handleBatchAdvance = () => {
    if (!user) return;
    orderIds.forEach((id) => advanceStation(id, user.name, user.role, note.trim() || undefined));
    showToast(t.checklist.batch.toastAdvanced(orderIds.join(', ')));
    setNote('');
    onDone();
  };

  const handleBatchNote = () => {
    if (!user || !note.trim()) return;
    orderIds.forEach((id) => addNote(id, user.name, user.role, note.trim()));
    showToast(t.checklist.batch.toastNote(orderIds.join(', ')));
    setNote('');
    onDone();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t.checklist.batch.title} subtitle={t.checklist.batch.subtitle(orderIds.length)}>
      {/* Lista explícita de qué OTs recibirán la acción — nunca "a todas" a secas. */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {orderIds.map((id) => (
          <span key={id} className="rounded-full border border-forge-border bg-forge-surface-2 px-2.5 py-1 text-xs font-medium text-forge-steel">
            {id}
          </span>
        ))}
      </div>

      <Textarea
        label={t.checklist.batch.noteLabel(orderIds.length)}
        placeholder={t.checklist.batch.notePlaceholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="secondary" size="lg" fullWidth onClick={handleBatchNote} disabled={!note.trim()}>
          {t.checklist.batch.addNoteBtn(label)}
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={handleBatchAdvance}>
          {t.checklist.batch.advanceBtn(label)}
        </Button>
      </div>
    </BottomSheet>
  );
}
