import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import type { WorkOrder } from '../../types/order';
import { formatStation } from '../../utils/formatters';

const CHECKLIST_BY_STATION: Record<string, string[]> = {
  ORDEN_COMPRA: ['OC validada con cliente', 'Montos y plazos confirmados'],
  COMPRA_INSUMOS: ['Cotización de materiales aprobada', 'Materiales recepcionados en bodega'],
  CORTE: ['Plano de corte revisado', 'Piezas cortadas dentro de tolerancia'],
  ARMADO_SOLDADURA: ['Ensamble según plano', 'Soldaduras inspeccionadas visualmente'],
  PINTURA: ['Superficie preparada (sandblasting)', 'Capas aplicadas según especificación'],
  CONTROL_CALIDAD: ['Dimensiones verificadas', 'Checklist de calidad firmado'],
  DESPACHO: ['Embalaje y protección aplicados', 'Guía de despacho generada'],
};

export function StationChecklist({ order }: { order: WorkOrder }) {
  const items = CHECKLIST_BY_STATION[order.currentStation] ?? [];
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  return (
    <Card>
      <CardTitle>{order.projectName} — {formatStation(order.currentStation)}</CardTitle>
      <p className="mt-1 text-xs text-forge-steel">{order.id} · {order.clientName}</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const isChecked = checked.has(item);
          const Icon = isChecked ? CheckSquare : Square;
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => toggle(item)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-forge-surface-2"
              >
                <Icon className={isChecked ? 'size-4 shrink-0 text-forge-ok' : 'size-4 shrink-0 text-forge-steel'} />
                <span className={isChecked ? 'text-forge-steel line-through' : ''}>{item}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
