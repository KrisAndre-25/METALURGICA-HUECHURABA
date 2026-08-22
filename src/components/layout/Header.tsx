import { useAuth } from '../../contexts/AuthContext';

export function Header({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-forge-border bg-forge-surface px-6 py-4">
      <h1 className="text-lg font-semibold">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs leading-tight text-forge-steel">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-forge-border px-3 py-1.5 text-xs font-medium text-forge-steel transition-colors hover:border-forge-accent hover:text-forge-accent"
          >
            Salir
          </button>
        </div>
      )}
    </header>
  );
}
