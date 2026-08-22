import { useState } from 'react';
import { ArrowRight, CheckSquare, Layers, Square } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { formatStation } from '../../utils/formatters';
import { STATIONS, type WorkOrder } from '../../types/order';
import { BatchUpdateSheet } from './BatchUpdateSheet';

export function FastChecklist() {
  const { user } = useAuth();
  const { orders, advanceStation } = useOrders();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchOpen, setBatchOpen] = useState(false);

  const active = orders
    .filter((o) => o.status !== 'COMPLETADO')
    .filter((o) => !user?.station || o.currentStation === user.station);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuickAdvance = (order: WorkOrder) => {
    if (!user) return;
    const isLast = order.currentStation === STATIONS[STATIONS.length - 1];
    const nextStation = STATIONS[STATIONS.indexOf(order.currentStation) + 1];
    advanceStation(order.id, user.name);
    showToast(
      isLast
        ? `${order.id} despachada — marcada como COMPLETADO.`
        : `${order.id} avanzó de ${formatStation(order.currentStation)} a ${formatStation(nextStation)}.`,
    );
  };

  return (
    <div className="space-y-3 pb-24">
      {user?.station && (
        <p className="text-xs text-forge-steel">Mostrando solo OTs en tu estación: {formatStation(user.station)}</p>
      )}

      {active.length === 0 && (
        <p className="py-10 text-center text-sm text-forge-steel">No hay OTs activas para revisar aquí.</p>
      )}

      {active.map((order) => {
        const isLast = order.currentStation === STATIONS[STATIONS.length - 1];
        const isSelected = selected.has(order.id);
        return (
          <div key={order.id} className="flex items-center gap-3 rounded-2xl border border-forge-border bg-forge-surface p-3">
            <button
              type="button"
              onClick={() => toggleSelect(order.id)}
              aria-label="Seleccionar para actualización en lote"
              className="shrink-0 p-1 text-forge-steel"
            >
              {isSelected ? <CheckSquare className="size-5 text-forge-accent" /> : <Square className="size-5" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{order.projectName}</p>
              <p className="text-xs text-forge-steel">{order.id} · {formatStation(order.currentStation)}</p>
            </div>

            <Button variant="primary" size="lg" icon={<ArrowRight className="size-5" />} onClick={() => handleQuickAdvance(order)}>
              {isLast ? 'Despachar' : 'Avanzar'}
            </Button>
          </div>
        );
      })}

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 sm:bottom-6">
          <Button size="lg" icon={<Layers className="size-5" />} onClick={() => setBatchOpen(true)} className="shadow-xl shadow-black/40">
            Actualizar {selected.size} seleccionadas
          </Button>
        </div>
      )}

      <BatchUpdateSheet
        open={batchOpen}
        orderIds={[...selected]}
        onClose={() => setBatchOpen(false)}
        onDone={() => {
          setSelected(new Set());
          setBatchOpen(false);
        }}
      />
    </div>
  );
}
