import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Factory, Gauge, Mail, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../components/ui/cn';
import type { UserRole } from '../types/user';

interface QuickRole {
  role: UserRole;
  email: string;
  title: string;
  subtitle: string;
  icon: typeof ShieldCheck;
}

const QUICK_ROLES: QuickRole[] = [
  {
    role: 'ADMIN',
    email: 'sergio@metalurgicahuechuraba.cl',
    title: 'Sergio Núñez — Admin',
    subtitle: 'Torre de Control completa · KPIs y alertas en UF',
    icon: ShieldCheck,
  },
  {
    role: 'OPERATOR',
    email: 'jsoto@metalurgicahuechuraba.cl',
    title: 'Taller / Oficina',
    subtitle: 'Fast Checklist · alta de OTs desde una OC',
    icon: Wrench,
  },
  {
    role: 'CLIENT',
    email: 'contacto@constructoraandes.cl',
    title: 'Empresa Mandante',
    subtitle: 'Portal B2B de seguimiento de pedidos',
    icon: Truck,
  },
];

/** Fondo animado liviano: grilla de micro-dots a la deriva + dos glows metálicos, solo `transform`/`opacity` (GPU, 60fps en mobile). */
function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-forge-bg">
      <motion.div
        className="absolute -inset-y-12 -inset-x-12 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-forge-border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        animate={{ x: [0, -28, 0], y: [0, -28, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -left-24 -top-24 size-[26rem] rounded-full bg-forge-accent/20 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -right-16 size-[28rem] rounded-full bg-forge-steel/10 blur-[110px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const attemptLogin = (value: string) => {
    if (!value.trim()) {
      setError('Ingresa un correo.');
      return;
    }
    setLoading(true);
    setError(null);
    // Pequeño delay simulado: da lugar al estado `loading` del botón sin bloquear la UI real.
    setTimeout(() => {
      const ok = login(value);
      setLoading(false);
      if (!ok) {
        setError('Correo no encontrado o usuario inactivo.');
        showToast('No pudimos iniciar sesión con ese correo.', 'error');
      } else {
        showToast('Sesión iniciada correctamente.');
      }
    }, 350);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    attemptLogin(email);
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm rounded-2xl border border-forge-border bg-forge-surface/90 p-6 backdrop-blur-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-forge-accent/15">
            <Factory className="size-7 text-forge-accent" />
          </div>
          <h1 className="text-lg font-bold">ForgeFlow</h1>
          <p className="text-xs text-forge-steel">Industrial Control Tower — Metalúrgica Huechuraba</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Correo"
            type="email"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSelectedRole(null); }}
            placeholder="nombre@dominio.cl"
            error={error ?? undefined}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={loading} icon={<Gauge className="size-4" />}>
            Ingresar
          </Button>
        </form>

        <div className="mt-6 space-y-2 border-t border-forge-border pt-5">
          <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-wide text-forge-steel">Acceso rápido de prueba</p>
          {QUICK_ROLES.map(({ role, email: roleEmail, title, subtitle, icon: Icon }) => (
            <motion.button
              key={role}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEmail(roleEmail); setSelectedRole(role); attemptLogin(roleEmail); }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                selectedRole === role ? 'border-forge-accent bg-forge-accent/10' : 'border-forge-border hover:border-forge-accent/40',
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-forge-surface-2">
                <Icon className="size-4 text-forge-accent" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="text-xs leading-snug text-forge-steel">{subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
