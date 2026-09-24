import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { STATIONS, type Priority, type SalesRequest, type Station } from '../../types/order';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';
import { formatPriority, formatStation, formatUF } from '../../utils/formatters';

const PRIORITIES: Priority[] = ['BAJA', 'NORMAL', 'ALTA', 'URGENTE'];
/** Despacho queda fuera: una OT nueva nunca puede partir lista para despachar. */
const START_STATIONS = STATIONS.filter((s) => s !== 'DESPACHO');
const DEFAULT_LEAD_DAYS = 30;

function toDateInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-forge-border/70 bg-forge-bg/40 p-3.5">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-forge-accent">{title}</legend>
      {children}
    </fieldset>
  );
}

/**
 * Modal "Revisar Solicitud": Administración ajusta los datos comerciales y de
 * planificación y aprueba — eso crea la OC y la OT (ver `loadPurchaseOrder`),
 * que recién ahí aparece en la Torre de Control. Exclusivo ADMIN.
 */
export function ReviewRequestModal({ request, onClose }: { request: SalesRequest | null; onClose: () => void }) {
  const { t } = useUiPrefs();
  return (
    <Modal open={request !== null} onClose={onClose} title={request ? `${t.pendingRequests.reviewTitle} · ${request.id}` : ''}>
      {/* `key` reinicia el formulario al cambiar de solicitud. */}
      {request && <ReviewForm key={request.id} request={request} onDone={onClose} />}
    </Modal>
  );
}

function ReviewForm({ request, onDone }: { request: SalesRequest; onDone: () => void }) {
  const { user, users } = useAuth();
  const { loadPurchaseOrder } = useOrders();
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();
  const tr = t.pendingRequests;

  const operators = useMemo(() => users.filter((u) => u.role === 'OPERATOR' && u.active), [users]);
  const suggestLead = (station: Station) => operators.find((o) => o.station === station)?.name ?? user?.name ?? '';

  const [form, setForm] = useState(() => ({
    projectName: request.projectName,
    description: request.description,
    finalAmountUF: String(request.estimatedAmountUF),
    initialStation: 'ORDEN_COMPRA' as Station,
    priority: request.priority,
    promisedDate: toDateInput(new Date(Date.now() + DEFAULT_LEAD_DAYS * 24 * 60 * 60 * 1000)),
    assignedOperator: suggestLead('ORDEN_COMPRA'),
    structureType: '',
    dimensions: '',
    weightTons: '',
    paintSpecification: '',
  }));
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleStationChange = (station: Station) => {
    // Si el responsable seguía siendo la sugerencia automática, se re-sugiere para la nueva estación.
    setForm((f) => ({
      ...f,
      initialStation: station,
      assignedOperator: f.assignedOperator === suggestLead(f.initialStation) ? suggestLead(station) : f.assignedOperator,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalAmountUF = Number(form.finalAmountUF);
    const weightTons = form.weightTons === '' ? 0 : Number(form.weightTons);
    if (!form.projectName.trim() || !form.promisedDate || !(finalAmountUF > 0) || Number.isNaN(weightTons)) {
      showToast(tr.toastMissing, 'error');
      return;
    }

    const created = loadPurchaseOrder(
      {
        salesRequestId: request.id,
        projectName: form.projectName,
        description: form.description,
        finalAmountUF,
        priority: form.priority,
        initialStation: form.initialStation,
        assignedOperator: form.assignedOperator || user.name,
        promisedDate: new Date(form.promisedDate).toISOString(),
        productSpecs: {
          structureType: form.structureType.trim() || 'Por definir',
          dimensions: form.dimensions.trim() || 'Por definir',
          weightTons,
          paintSpecification: form.paintSpecification.trim() || 'Sin especificar',
        },
      },
      user.name,
      user.role,
    );

    if (!created) {
      showToast(tr.toastError, 'error');
      onDone();
      return;
    }

    showToast(tr.toastApproved(created.id));
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-forge-steel">
        {request.clientName} · {request.clientRut} · {t.salesRequest.requestedBy}: <span className="text-slate-200">{request.requestedBy}</span>
      </p>

      <FormSection title={tr.sectionCommercial}>
        <Input label={tr.projectName} value={form.projectName} onChange={(e) => set('projectName', e.target.value)} required />
        <Textarea label={tr.description} value={form.description} onChange={(e) => set('description', e.target.value)} />
        <Input
          label={tr.finalAmount}
          type="number"
          min="0"
          step="0.01"
          value={form.finalAmountUF}
          onChange={(e) => set('finalAmountUF', e.target.value)}
          hint={tr.estimatedHint(formatUF(request.estimatedAmountUF, language))}
          required
        />
      </FormSection>

      <FormSection title={tr.sectionProduction}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label={tr.initialStation}
            value={form.initialStation}
            onChange={(e) => handleStationChange(e.target.value as Station)}
            hint={form.initialStation === 'ORDEN_COMPRA' ? tr.initialStationDefaultHint : undefined}
          >
            {START_STATIONS.map((s) => <option key={s} value={s}>{formatStation(s, language)}</option>)}
          </Select>
          <Select label={tr.priority} value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{formatPriority(p, language)}</option>)}
          </Select>
          <Input
            label={tr.promisedDate}
            type="date"
            min={toDateInput(new Date())}
            value={form.promisedDate}
            onChange={(e) => set('promisedDate', e.target.value)}
            required
          />
          <Select label={tr.workshopLead} value={form.assignedOperator} onChange={(e) => set('assignedOperator', e.target.value)}>
            {user && <option value={user.name}>{user.name}</option>}
            {operators.map((o) => (
              <option key={o.id} value={o.name}>
                {o.name}{o.station ? ` · ${formatStation(o.station, language)}` : ''}
              </option>
            ))}
          </Select>
        </div>
      </FormSection>

      <FormSection title={tr.sectionSpecs}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t.orders.specsForm.structureType}
            placeholder={t.orders.specsForm.structureTypePlaceholder}
            value={form.structureType}
            onChange={(e) => set('structureType', e.target.value)}
          />
          <Input label={t.orders.specsForm.weight} type="number" step="0.1" min="0" value={form.weightTons} onChange={(e) => set('weightTons', e.target.value)} />
        </div>
        <Input
          label={t.orders.specsForm.dimensions}
          placeholder={t.orders.specsForm.dimensionsPlaceholder}
          value={form.dimensions}
          onChange={(e) => set('dimensions', e.target.value)}
        />
        <Input
          label={t.orders.specsForm.paint}
          placeholder={t.orders.specsForm.paintPlaceholder}
          value={form.paintSpecification}
          onChange={(e) => set('paintSpecification', e.target.value)}
        />
      </FormSection>

      <Button
        type="submit"
        fullWidth
        size="lg"
        icon={<CheckCircle2 className="size-5" />}
        className="bg-forge-ok hover:bg-forge-ok/90 focus-visible:ring-forge-ok"
      >
        {tr.approve}
      </Button>
    </form>
  );
}
