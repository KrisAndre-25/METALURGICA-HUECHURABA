import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { Priority } from '../../types/order';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';

const EMPTY_FORM = {
  clientName: '',
  clientRut: '',
  projectName: '',
  description: '',
  estimatedAmountUF: '',
  priority: 'NORMAL' as Priority,
};

/** Pantalla de inicio del Vendedor: registra la venta recibida y le asigna Prioridad. */
export function SalesRequestForm() {
  const { user } = useAuth();
  const { createSalesRequest } = useOrders();
  const { t } = useUiPrefs();
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const estimatedAmountUF = Number(form.estimatedAmountUF);
    if (!form.clientName.trim() || !form.clientRut.trim() || !form.projectName.trim() || Number.isNaN(estimatedAmountUF)) {
      showToast(t.salesRequest.toastMissing, 'error');
      return;
    }

    const created = createSalesRequest(
      {
        clientName: form.clientName.trim(),
        clientRut: form.clientRut.trim(),
        projectName: form.projectName.trim(),
        description: form.description.trim(),
        estimatedAmountUF,
        priority: form.priority,
      },
      user.name,
    );

    showToast(t.salesRequest.toastCreated(created.id));
    setForm(EMPTY_FORM);
  };

  return (
    <Card>
      <CardTitle>{t.salesRequest.formTitle}</CardTitle>
      <p className="mt-1 text-xs text-forge-steel">{t.salesRequest.formSubtitle}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t.salesRequest.clientName}
            placeholder={t.salesRequest.clientNamePlaceholder}
            value={form.clientName}
            onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
            required
          />
          <Input
            label={t.salesRequest.clientRut}
            placeholder={t.salesRequest.clientRutPlaceholder}
            value={form.clientRut}
            onChange={(e) => setForm((f) => ({ ...f, clientRut: e.target.value }))}
            required
          />
        </div>

        <Input
          label={t.salesRequest.projectName}
          placeholder={t.salesRequest.projectNamePlaceholder}
          value={form.projectName}
          onChange={(e) => setForm((f) => ({ ...f, projectName: e.target.value }))}
          required
        />

        <Textarea
          label={t.salesRequest.description}
          placeholder={t.salesRequest.descriptionPlaceholder}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t.salesRequest.estimatedAmount}
            type="number"
            step="1"
            min="0"
            value={form.estimatedAmountUF}
            onChange={(e) => setForm((f) => ({ ...f, estimatedAmountUF: e.target.value }))}
            required
          />
          <Select
            label={t.salesRequest.priority}
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            <option value="BAJA">{t.orders.specsForm.priorityBaja}</option>
            <option value="NORMAL">{t.orders.specsForm.priorityNormal}</option>
            <option value="ALTA">{t.orders.specsForm.priorityAlta}</option>
            <option value="URGENTE">{t.orders.specsForm.priorityUrgente}</option>
          </Select>
        </div>

        <Button type="submit" fullWidth size="lg" icon={<Send className="size-5" />}>
          {t.salesRequest.submit}
        </Button>
      </form>
    </Card>
  );
}
