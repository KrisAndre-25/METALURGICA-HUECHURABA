import { useState, type FormEvent } from 'react';
import { Factory } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const QUICK_LOGINS = [
  { role: 'ADMIN', email: 'sergio@metalurgicahuechuraba.cl' },
  { role: 'OPERATOR', email: 'jsoto@metalurgicahuechuraba.cl' },
  { role: 'CLIENT', email: 'contacto@constructoraandes.cl' },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const attemptLogin = (value: string) => {
    if (!login(value)) {
      setError('Correo no encontrado o usuario inactivo.');
    } else {
      setError(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    attemptLogin(email);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-forge-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-forge-border bg-forge-surface p-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Factory className="size-9 text-forge-accent" />
          <h1 className="text-lg font-bold">ForgeFlow</h1>
          <p className="text-xs text-forge-steel">Industrial Control Tower — Metalúrgica Huechuraba</p>
        </div>
        <label className="mb-1 block text-xs font-medium text-forge-steel" htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@dominio.cl"
          className="mb-3 h-13 w-full rounded-xl border border-forge-border bg-forge-bg px-4 text-base outline-none focus:border-forge-accent"
          required
        />
        {error && <p className="mb-3 text-xs text-forge-stopped">{error}</p>}
        <button
          type="submit"
          className="h-13 w-full rounded-xl bg-forge-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          Ingresar
        </button>

        <div className="mt-5 space-y-1.5 border-t border-forge-border pt-4">
          <p className="mb-2 text-center text-[11px] text-forge-steel">Acceso rápido de prueba</p>
          {QUICK_LOGINS.map((q) => (
            <button
              key={q.email}
              type="button"
              onClick={() => { setEmail(q.email); attemptLogin(q.email); }}
              className="flex w-full items-center justify-between rounded-lg border border-forge-border px-3 py-2 text-xs text-forge-steel transition-colors hover:border-forge-accent/50 hover:text-slate-100"
            >
              <span>{q.role}</span>
              <span className="truncate">{q.email}</span>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
