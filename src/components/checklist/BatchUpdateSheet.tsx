import { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
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
  const [note, setNote] = useState('');

  const handleBatchAdvance = () => {
    if (!user) return;
    orderIds.forEach((id) => advanceStation(id, user.name, note.trim() || undefined));
    showToast(`${orderIds.length} OTs avanzaron, cada una a su siguiente estación.`);
    setNote('');
    onDone();
  };

  const handleBatchNote = () => {
    if (!user || !note.trim()) return;
    orderIds.forEach((id) => addNote(id, user.name, note.trim()));
    showToast(`Nota agregada a ${orderIds.length} OTs.`);
    setNote('');
    onDone();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Actualización en lote" subtitle={`${orderIds.length} OTs seleccionadas`}>
      <Textarea
        label="Nota (ej: incidencia común a todas)"
        placeholder="Ej: cuadrilla reasignada por licencia médica…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-4 flex flex-col gap-2">
        <Button variant="secondary" size="lg" fullWidth onClick={handleBatchNote} disabled={!note.trim()}>
          Solo agregar nota a todas
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={handleBatchAdvance}>
          Avanzar las {orderIds.length} a la siguiente estación
        </Button>
      </div>
    </BottomSheet>
  );
}
