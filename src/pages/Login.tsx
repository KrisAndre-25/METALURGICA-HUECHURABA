import { useState, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Handshake, Lock, Mail, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Loader } from '../components/ui/Loader';
import { useUiPrefs } from '../contexts/UiPrefsContext';
import { cn } from '../components/ui/cn';
import type { UserRole } from '../types/user';

interface QuickRole {
  role: UserRole;
  email: string;
  label: string;
  icon: typeof ShieldCheck;
}

const DEMO_PASSWORD = 'demo1234';

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

/** Input con la estética Uiverse adaptada: fondo forge-surface, sombra interna "hundida", sin el Input del design system (esto es exclusivo de esta pantalla). */
function DarkField(props: {
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">{props.icon}</span>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        required={props.required}
        className={cn(
          'h-13 w-full rounded-2xl border-none bg-forge-surface pl-11 pr-4 text-sm text-neutral-100 outline-none',
          'shadow-[inset_2px_5px_10px_rgb(5,5,5)] placeholder:text-neutral-600',
          'transition-shadow focus:shadow-[inset_2px_5px_10px_rgb(5,5,5),0_0_0_2px_var(--color-forge-accent)]',
        )}
      />
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useUiPrefs();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  /**
   * Los correos son los usuarios reales que ya existen en `mockUsers.ts` — no
   * `admin@metalurgicahuechuraba.cl` / `operador@metalurgicahuechuraba.cl` /
   * `cliente@constructora.cl` que no están registrados en el sistema. Usar esos
   * literalmente haría fallar el login de prueba, así que mapeé cada rol pedido
   * a su equivalente real ya existente (mismo dominio real de la planta).
   */
  const QUICK_ROLES: QuickRole[] = [
    { role: 'ADMIN', email: 'sergio@metalurgicahuechuraba.cl', label: t.login.roleAdmin, icon: ShieldCheck },
    { role: 'OPERATOR', email: 'jsoto@metalurgicahuechuraba.cl', label: t.login.roleOperator, icon: Wrench },
    { role: 'VENDEDOR', email: 'diego@metalurgicahuechuraba.cl', label: t.login.roleVendedor, icon: Handshake },
    { role: 'CLIENT', email: 'contacto@constructoraandes.cl', label: t.login.roleClient, icon: Truck },
  ];

  const selectRole = (role: QuickRole) => {
    setEmail(role.email);
    setPassword(DEMO_PASSWORD);
    setSelectedRole(role.role);
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(t.login.errorEmpty);
      return;
    }
    setLoading(true);
    setError(null);
    // Pequeño delay simulado: da lugar al estado `loading` del botón sin bloquear la UI real.
    setTimeout(() => {
      const ok = login(email);
      setLoading(false);
      if (!ok) {
        setError(t.login.errorNotFound);
        showToast(t.login.toastError, 'error');
      } else {
        showToast(t.login.toastSuccess);
      }
    }, 350);
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-x-hidden px-4 py-10">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm rounded-[25px] bg-forge-surface p-6 shadow-2xl shadow-black/60"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img src="/icono_software.png" alt="DMAIX Logo" className="w-16 h-16 mb-4 object-contain" />
          <h1 className="text-lg font-bold text-neutral-100">{t.login.appName}</h1>
          <p className="text-xs text-neutral-500">{t.login.tagline}</p>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-2">
          {QUICK_ROLES.map((role) => {
            const Icon = role.icon;
            const isActive = selectedRole === role.role;
            return (
              <motion.button
                key={role.role}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                onClick={() => selectRole(role)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl bg-forge-surface px-1.5 py-3 text-center transition-all',
                  'shadow-[inset_2px_5px_10px_rgb(5,5,5)]',
                  isActive ? 'ring-2 ring-forge-accent' : 'ring-1 ring-white/5',
                )}
              >
                <Icon className={cn('size-4', isActive ? 'text-forge-accent' : 'text-neutral-400')} />
                <span className="text-[10px] font-medium leading-tight text-neutral-300">{role.label}</span>
              </motion.button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <DarkField
            type="email"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(v) => { setEmail(v); setSelectedRole(null); }}
            placeholder={t.login.emailPlaceholder}
            required
          />
          <DarkField
            type="password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={setPassword}
            placeholder={t.login.passwordPlaceholder}
          />
          {error && <p className="px-1 text-xs text-forge-stopped">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl bg-forge-accent text-sm font-semibold text-white transition-all disabled:opacity-60"
          >
            {loading && <Loader size="sm" />}
            {loading ? t.login.submitLoading : t.login.submitIdle}
          </motion.button>

          <button
            type="button"
            onClick={() => showToast(t.login.forgotPasswordToast, 'info')}
            className="block w-full text-center text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            {t.login.forgotPassword}
          </button>
        </form>
      </motion.div>

      {/* Transición hacia el dashboard: cubre la pantalla mientras se resuelve
          el login, en vez de dejar solo el spinner del botón como única señal. */}
      {loading && <Loader fullScreen size="lg" label={t.login.submitLoading} />}
    </div>
  );
}
