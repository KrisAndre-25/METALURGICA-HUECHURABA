import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useToast } from '../ui/Toast';

/** "Mi Perfil": disponible para cualquier rol autenticado, para editar nombre y correo. */
export function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { t } = useUiPrefs();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = updateProfile({ name, email });
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? t.profile.editProfile.errorGeneric);
      return;
    }
    showToast(t.profile.editProfile.toastUpdated);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={t.profile.editProfile.title} subtitle={t.profile.editProfile.subtitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t.profile.editProfile.name} value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label={t.profile.editProfile.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} required />
        <Button type="submit" fullWidth size="lg" loading={saving} icon={<Save className="size-4" />}>
          {t.profile.editProfile.save}
        </Button>
      </form>
    </BottomSheet>
  );
}
