import { useState, type FormEvent } from 'react';
import { Factory } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!login(email)) {
      setError('Correo no encontrado o usuario inactivo.');
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-forge-bg px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-forge-border bg-forge-surface p-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Factory className="size-9 text-forge-accent" />
          <h1 className="text-lg font-bold">ForgeFlow</h1>
          <p className="text-xs text-forge-steel">Metalúrgica Huechuraba — Trazabilidad Operacional</p>
        </div>
        <label className="mb-1 block text-xs font-medium text-forge-steel" htmlFor="email">Correo corporativo</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@metalurgicahuechuraba.cl"
          className="mb-3 w-full rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm outline-none focus:border-forge-accent"
          required
        />
        {error && <p className="mb-3 text-xs text-forge-stopped">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-forge-accent py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ingresar
        </button>
        <p className="mt-4 text-center text-[11px] text-forge-steel">
          Prueba con: mvidal@metalurgicahuechuraba.cl
        </p>
      </form>
    </div>
  );
}
