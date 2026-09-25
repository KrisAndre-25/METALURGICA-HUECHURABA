import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Handshake, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Loader } from '../components/ui/Loader';
import { useUiPrefs } from '../contexts/UiPrefsContext';
import { cn } from '../components/ui/cn';
import './loginFlip.css';
import type { UserRole } from '../types/user';

interface QuickRole {
  role: UserRole;
  email: string;
  label: string;
  icon: typeof ShieldCheck;
}

const DEMO_PASSWORD = 'demo1234';

/**
 * Fondo: el mismo fondo único de la landing (`.landing-backdrop`, ver index.css)
 * más una grilla de micro-dots a la deriva, para que Landing → Login no salte de paleta.
 */
function AnimatedBackground() {
  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-x-12 -inset-y-12 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        animate={{ x: [0, -28, 0], y: [0, -28, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function Login({ onBack }: { onBack?: () => void }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useUiPrefs();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  // Cara trasera de la tarjeta (cuentas de demo).
  const [flipped, setFlipped] = useState(false);

  /**
   * Cuentas de demo: son los usuarios reales de `mockUsers.ts` (mismo dominio de
   * la planta), así el login de prueba funciona con un toque.
   */
  const QUICK_ROLES: QuickRole[] = [
    { role: 'ADMIN', email: 'sergio@metalurgicahuechuraba.cl', label: t.login.roleAdmin, icon: ShieldCheck },
    { role: 'OPERATOR', email: 'jsoto@metalurgicahuechuraba.cl', label: t.login.roleOperator, icon: Wrench },
    { role: 'VENDEDOR', email: 'diego@metalurgicahuechuraba.cl', label: t.login.roleVendedor, icon: Handshake },
    { role: 'CLIENT', email: 'contacto@constructoraandes.cl', label: t.login.roleClient, icon: Truck },
  ];

  // Elegir una cuenta de demo rellena el formulario y gira la tarjeta de vuelta al login.
  const selectRole = (role: QuickRole) => {
    setEmail(role.email);
    setPassword(DEMO_PASSWORD);
    setSelectedRole(role.role);
    setError(null);
    setFlipped(false);
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

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-white sm:left-6 sm:top-6"
        >
          <ArrowLeft className="size-3.5" /> {t.login.back}
        </button>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flip-login">
        <div className={cn('fl-card', flipped && 'is-flipped')}>
          {/* Cara frontal: iniciar sesión. `inert` en la cara oculta: no se puede tabular a botones de espaldas. */}
          <form onSubmit={handleSubmit} noValidate className="fl-face" inert={flipped}>
            <img src="/icono_software.png" alt="DMAIX Logo" className="size-14 rounded-full object-cover drop-shadow-[0_0_14px_rgba(6,182,212,0.35)]" />
            <div className="-mt-2 text-center">
              <h1 className="fl-title">{t.login.submitIdle}</h1>
              <p className="text-xs text-slate-400">{t.login.tagline}</p>
            </div>

            <input
              id="login-email"
              type="email"
              className="fl-input"
              placeholder={t.login.emailPlaceholder}
              aria-label={t.login.emailPlaceholder}
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedRole(null);
              }}
              required
            />
            <input
              id="login-password"
              type="password"
              className="fl-input"
              placeholder={t.login.passwordPlaceholder}
              aria-label={t.login.passwordPlaceholder}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {selectedRole && (
              <p className="-my-2 text-[11px] font-medium text-[#10B981]">
                {t.login.demoSelected(QUICK_ROLES.find((r) => r.role === selectedRole)?.label ?? '')}
              </p>
            )}
            {error && (
              <p role="alert" className="-my-2 text-xs font-medium text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="fl-btn">
              {loading && <Loader size="sm" />}
              {loading ? t.login.submitLoading : t.login.submitIdle}
            </button>

            <span className="fl-switch">
              {t.login.demoPrompt}{' '}
              <button type="button" className="fl-toggle" onClick={() => setFlipped(true)}>
                {t.login.demoLink}
              </button>
            </span>
            <button
              type="button"
              onClick={() => showToast(t.login.forgotPasswordToast, 'info')}
              className="-mt-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              {t.login.forgotPassword}
            </button>
          </form>

          {/* Cara trasera: cuentas de demo (DMAIX no tiene auto-registro; las cuentas las crea Administración). */}
          <div className="fl-face fl-back" inert={!flipped}>
            <div className="text-center">
              <h2 className="fl-title">{t.login.demoTitle}</h2>
              <p className="text-xs text-slate-400">{t.login.demoSubtitle}</p>
            </div>
            {QUICK_ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button key={role.role} type="button" className="fl-account" onClick={() => selectRole(role)}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-300">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{role.label}</span>
                    <span className="block truncate text-[11px] text-slate-400">{role.email}</span>
                  </span>
                </button>
              );
            })}
            <span className="fl-switch">
              {t.login.demoBackPrompt}{' '}
              <button type="button" className="fl-toggle" onClick={() => setFlipped(false)}>
                {t.login.submitIdle}
              </button>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Transición hacia el dashboard: cubre la pantalla mientras se resuelve el login. */}
      {loading && <Loader fullScreen size="lg" label={t.login.submitLoading} />}
    </div>
  );
}
