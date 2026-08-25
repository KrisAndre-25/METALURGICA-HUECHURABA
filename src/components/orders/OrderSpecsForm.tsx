import { useState, type FormEvent } from 'react';
import { PackagePlus } from 'lucide-react';
import type { SalesRequest } from '../../types/order';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';

const EMPTY_FORM = {
  structureType: '',
  dimensions: '',
  weightTons: '',
  paintSpecification: '',
  promisedDate: '',
};

/**
 * Completa las especificaciones técnicas de una Solicitud de Venta ya aprobada
 * y la "carga" — ÚNICA vía por la que una OC entra al sistema (ver `loadPurchaseOrder`
 * en OrderContext): crea la OC y genera automáticamente la OT en Etapa 1, con
 * Solicitud de Insumos como siguiente estación. Exclusivo ADMIN.
 */
export function OrderSpecsForm({ request, onDone }: { request: SalesRequest; onDone: () => void }) {
  const { user } = useAuth();
  const { loadPurchaseOrder } = useOrders();
  const { t } = useUiPrefs();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const weightTons = Number(form.weightTons);
    if (!form.structureType.trim() || !form.dimensions.trim() || Number.isNaN(weightTons) || !form.promisedDate) {
      showToast(t.orders.specsForm.toastMissing, 'error');
      return;
    }

    const created = loadPurchaseOrder(
      {
        salesRequestId: request.id,
        productSpecs: {
          structureType: form.structureType.trim(),
          dimensions: form.dimensions.trim(),
          weightTons,
          paintSpecification: form.paintSpecification.trim() || 'Sin especificar',
        },
        promisedDate: new Date(form.promisedDate).toISOString(),
      },
      user.name,
      user.role,
    );

    if (!created) {
      showToast(t.orders.specsForm.toastMissing, 'error');
      return;
    }

    showToast(t.orders.specsForm.toastCreated(created.id));
    setForm(EMPTY_FORM);
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t.orders.specsForm.structureType}
          placeholder={t.orders.specsForm.structureTypePlaceholder}
          value={form.structureType}
          onChange={(e) => setForm((f) => ({ ...f, structureType: e.target.value }))}
          required
        />
        <Input
          label={t.orders.specsForm.weight}
          type="number"
          step="0.1"
          min="0"
          value={form.weightTons}
          onChange={(e) => setForm((f) => ({ ...f, weightTons: e.target.value }))}
          required
        />
      </div>

      <Input
        label={t.orders.specsForm.dimensions}
        placeholder={t.orders.specsForm.dimensionsPlaceholder}
        value={form.dimensions}
        onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
        required
      />

      <Textarea
        label={t.orders.specsForm.paint}
        placeholder={t.orders.specsForm.paintPlaceholder}
        value={form.paintSpecification}
        onChange={(e) => setForm((f) => ({ ...f, paintSpecification: e.target.value }))}
      />

      <Input
        label={t.orders.specsForm.promisedDate}
        type="date"
        value={form.promisedDate}
        onChange={(e) => setForm((f) => ({ ...f, promisedDate: e.target.value }))}
        required
      />

      <Button type="submit" fullWidth size="lg" icon={<PackagePlus className="size-5" />}>
        {t.orders.specsForm.submitLoad}
      </Button>
    </form>
  );
}
