import { useState, type FormEvent } from 'react';
import { Pencil, Power, Trash2, UserPlus } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/BottomSheet';
import { Input, Select } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useToast } from '../ui/Toast';
import { mockDataService } from '../../services/mockDataService';
import { formatStation } from '../../utils/formatters';
import type { Station } from '../../types/order';
import type { User, WorkerInput } from '../../types/user';

const STATIONS = mockDataService.getStations();

const EMPTY_FORM: WorkerInput = { name: '', rut: '', email: '', position: '', station: undefined };

/** CRUD completo de trabajadores del taller/oficina — exclusivo ADMIN. */
export function WorkerManagement() {
  const { users, addWorker, updateWorker, toggleWorkerActive, deleteWorker } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useUiPrefs();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkerInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const workers = users.filter((u) => u.role === 'OPERATOR');
  const wm = t.profile.workerManagement;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (worker: User) => {
    setEditingId(worker.id);
    setForm({ name: worker.name, rut: worker.rut ?? '', email: worker.email, position: worker.position ?? '', station: worker.station });
    setError(null);
    setFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rut.trim() || !form.email.trim() || !form.position.trim()) {
      setError(wm.errorRequired);
      return;
    }
    if (!/^\d{7,8}-[\dkK]$/.test(form.rut.trim())) {
      setError(wm.errorRut);
      return;
    }

    if (editingId) {
      updateWorker(editingId, form);
      showToast(wm.toastUpdated(form.name));
    } else {
      const created = addWorker(form);
      if (!created) {
        setError(wm.errorCreateFailed);
        return;
      }
      showToast(wm.toastCreated(created.name));
    }
    setFormOpen(false);
  };

  const handleToggleActive = (worker: User) => {
    toggleWorkerActive(worker.id);
    showToast(worker.active ? wm.toastDeactivated(worker.name) : wm.toastReactivated(worker.name));
  };

  const handleDelete = (worker: User) => {
    if (pendingDeleteId !== worker.id) {
      setPendingDeleteId(worker.id);
      return;
    }
    const ok = deleteWorker(worker.id);
    setPendingDeleteId(null);
    if (ok) showToast(wm.toastDeleted(worker.name));
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle>{wm.title(workers.length)}</CardTitle>
        <Button size="sm" icon={<UserPlus className="size-3.5" />} onClick={openCreate}>
          {wm.add}
        </Button>
      </div>

      <ul className="divide-y divide-forge-border/60">
        {workers.map((worker) => (
          <li key={worker.id} className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{worker.name}</p>
                {!worker.active && <Badge tone="neutral">{wm.inactive}</Badge>}
              </div>
              <p className="truncate text-xs text-forge-steel">
                {worker.position ?? wm.noPosition} {worker.station && `· ${formatStation(worker.station, language)}`}
              </p>
              <p className="truncate text-[11px] text-forge-steel">{worker.rut} · {worker.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => openEdit(worker)} className="rounded-lg p-2 text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100" aria-label={wm.edit}>
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={() => handleToggleActive(worker)} className="rounded-lg p-2 text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100" aria-label={wm.toggleActive}>
                <Power className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(worker)}
                className={`rounded-lg p-2 transition-colors ${pendingDeleteId === worker.id ? 'bg-forge-stopped/15 text-forge-stopped' : 'text-forge-steel hover:bg-forge-stopped/10 hover:text-forge-stopped'}`}
                aria-label={wm.delete}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {workers.length === 0 && <p className="py-6 text-center text-sm text-forge-steel">{wm.none}</p>}
      </ul>
      {pendingDeleteId && (
        <p className="mt-1 text-center text-[11px] text-forge-stopped">{wm.confirmDelete}</p>
      )}

      <BottomSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? wm.sheetTitleEdit : wm.sheetTitleCreate}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label={wm.name} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label={wm.rut} placeholder="12345678-9" value={form.rut} onChange={(e) => setForm((f) => ({ ...f, rut: e.target.value }))} required />
            <Input label={wm.email} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <Input
            label={wm.position}
            placeholder={wm.positionPlaceholder}
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            required
          />
          <Select
            label={wm.station}
            value={form.station ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, station: (e.target.value || undefined) as Station | undefined }))}
          >
            <option value="">{wm.noStation}</option>
            {STATIONS.map((s) => (
              <option key={s.key} value={s.key}>{formatStation(s.key, language)}</option>
            ))}
          </Select>
          {error && <p className="text-xs text-forge-stopped">{error}</p>}
          <Button type="submit" fullWidth size="lg">
            {editingId ? wm.saveEdit : wm.saveCreate}
          </Button>
        </form>
      </BottomSheet>
    </Card>
  );
}
