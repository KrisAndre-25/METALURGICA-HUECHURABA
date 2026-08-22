import { useState, type FormEvent } from 'react';
import { Pencil, Power, Trash2, UserPlus } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BottomSheet } from '../ui/BottomSheet';
import { Input, Select } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkerInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const workers = users.filter((u) => u.role === 'OPERATOR');

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
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (!/^\d{7,8}-[\dkK]$/.test(form.rut.trim())) {
      setError('RUT inválido. Formato esperado: 12345678-9');
      return;
    }

    if (editingId) {
      updateWorker(editingId, form);
      showToast(`${form.name} actualizado.`);
    } else {
      const created = addWorker(form);
      if (!created) {
        setError('No se pudo crear el trabajador.');
        return;
      }
      showToast(`${created.name} agregado al equipo.`);
    }
    setFormOpen(false);
  };

  const handleToggleActive = (worker: User) => {
    toggleWorkerActive(worker.id);
    showToast(worker.active ? `${worker.name} desactivado.` : `${worker.name} reactivado.`);
  };

  const handleDelete = (worker: User) => {
    if (pendingDeleteId !== worker.id) {
      setPendingDeleteId(worker.id);
      return;
    }
    const ok = deleteWorker(worker.id);
    setPendingDeleteId(null);
    if (ok) showToast(`${worker.name} eliminado.`);
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <CardTitle>Trabajadores ({workers.length})</CardTitle>
        <Button size="sm" icon={<UserPlus className="size-3.5" />} onClick={openCreate}>
          Agregar
        </Button>
      </div>

      <ul className="divide-y divide-forge-border/60">
        {workers.map((worker) => (
          <li key={worker.id} className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{worker.name}</p>
                {!worker.active && <Badge tone="neutral">Inactivo</Badge>}
              </div>
              <p className="truncate text-xs text-forge-steel">
                {worker.position ?? 'Sin cargo'} {worker.station && `· ${formatStation(worker.station)}`}
              </p>
              <p className="truncate text-[11px] text-forge-steel">{worker.rut} · {worker.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => openEdit(worker)} className="rounded-lg p-2 text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100" aria-label="Editar">
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={() => handleToggleActive(worker)} className="rounded-lg p-2 text-forge-steel hover:bg-forge-surface-2 hover:text-slate-100" aria-label="Activar/desactivar">
                <Power className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(worker)}
                className={`rounded-lg p-2 transition-colors ${pendingDeleteId === worker.id ? 'bg-forge-stopped/15 text-forge-stopped' : 'text-forge-steel hover:bg-forge-stopped/10 hover:text-forge-stopped'}`}
                aria-label="Eliminar"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {workers.length === 0 && <p className="py-6 text-center text-sm text-forge-steel">No hay trabajadores registrados.</p>}
      </ul>
      {pendingDeleteId && (
        <p className="mt-1 text-center text-[11px] text-forge-stopped">Toca eliminar de nuevo para confirmar.</p>
      )}

      <BottomSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Editar trabajador' : 'Agregar trabajador'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nombre completo" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="RUT" placeholder="12345678-9" value={form.rut} onChange={(e) => setForm((f) => ({ ...f, rut: e.target.value }))} required />
            <Input label="Correo" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>
          <Input
            label="Cargo"
            placeholder="Ej: Operador Corte, Supervisor de Planta…"
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            required
          />
          <Select
            label="Estación asignada"
            value={form.station ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, station: (e.target.value || undefined) as Station | undefined }))}
          >
            <option value="">Sin estación fija (oficina)</option>
            {STATIONS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </Select>
          {error && <p className="text-xs text-forge-stopped">{error}</p>}
          <Button type="submit" fullWidth size="lg">
            {editingId ? 'Guardar cambios' : 'Agregar trabajador'}
          </Button>
        </form>
      </BottomSheet>
    </Card>
  );
}
