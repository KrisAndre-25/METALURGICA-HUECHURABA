import { useState, type FormEvent } from 'react';
import { PackagePlus } from 'lucide-react';
import type { Priority } from '../../types/order';
import { mockPurchaseOrders } from '../../data/mockPurchaseOrders';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { TouchInput, TouchSelect, TouchTextarea } from '../ui/TouchInput';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';

const EMPTY_FORM = {
  purchaseOrderId: '',
  projectName: '',
  structureType: '',
  dimensions: '',
  weightTons: '',
  paintSpecification: '',
  promisedDate: '',
  priority: 'NORMAL' as Priority,
};

export function OrderSpecsForm() {
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const openPurchaseOrders = mockPurchaseOrders.filter((oc) => oc.status !== 'COMPLETADA');
  const selectedOc = openPurchaseOrders.find((oc) => oc.id === form.purchaseOrderId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOc) return;

    const weightTons = Number(form.weightTons);
    if (!form.projectName.trim() || !form.structureType.trim() || !form.dimensions.trim() || Number.isNaN(weightTons) || !form.promisedDate) {
      showToast('Completa todos los campos obligatorios.', 'error');
      return;
    }

    const created = createOrder({
      purchaseOrderId: selectedOc.id,
      clientName: selectedOc.clientName,
      projectName: form.projectName.trim(),
      productSpecs: {
        structureType: form.structureType.trim(),
        dimensions: form.dimensions.trim(),
        weightTons,
        paintSpecification: form.paintSpecification.trim() || 'Sin especificar',
      },
      promisedDate: new Date(form.promisedDate).toISOString(),
      priority: form.priority,
    }, user.name);

    showToast(`${created.id} creada e ingresada a Orden de Compra.`);
    setForm(EMPTY_FORM);
  };

  return (
    <Card>
      <CardTitle>Nueva OT desde una OC</CardTitle>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <TouchSelect
          label="Orden de Compra"
          value={form.purchaseOrderId}
          onChange={(e) => setForm((f) => ({ ...f, purchaseOrderId: e.target.value }))}
          required
        >
          <option value="">Selecciona una OC…</option>
          {openPurchaseOrders.map((oc) => (
            <option key={oc.id} value={oc.id}>{oc.id} · {oc.clientName}</option>
          ))}
        </TouchSelect>

        <TouchInput
          label="Nombre del proyecto"
          placeholder="Ej: Cercha Techumbre Bodega 6"
          value={form.projectName}
          onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <TouchInput
            label="Tipo de estructura"
            placeholder="Galpón, viga, cercha…"
            value={form.structureType}
            onChange={(e) => setForm((f) => ({ ...f, structureType: e.target.value }))}
            required
          />
          <TouchInput
            label="Peso (ton)"
            type="number"
            step="0.1"
            min="0"
            value={form.weightTons}
            onChange={(e) => setForm((f) => ({ ...f, weightTons: e.target.value }))}
            required
          />
        </div>

        <TouchInput
          label="Dimensiones"
          placeholder="Ej: 20m x 12m x 4m"
          value={form.dimensions}
          onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
          required
        />

        <TouchTextarea
          label="Especificación de pintura"
          placeholder="Ej: Anticorrosivo + esmalte RAL 7016"
          value={form.paintSpecification}
          onChange={(e) => setForm((f) => ({ ...f, paintSpecification: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <TouchInput
            label="Fecha comprometida"
            type="date"
            value={form.promisedDate}
            onChange={(e) => setForm((f) => ({ ...f, promisedDate: e.target.value }))}
            required
          />
          <TouchSelect
            label="Prioridad"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            <option value="BAJA">Baja</option>
            <option value="NORMAL">Normal</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </TouchSelect>
        </div>

        <Button type="submit" fullWidth size="lg" icon={<PackagePlus className="size-5" />}>
          Crear Orden de Fabricación
        </Button>
      </form>
    </Card>
  );
}
