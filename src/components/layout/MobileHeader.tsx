import { Factory } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Administrador', OPERATOR: 'Taller/Oficina', CLIENT: 'Cliente' };

export function MobileHeader({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-forge-border bg-forge-surface/95 px-4 py-3 backdrop-blur sm:hidden">
      <div className="flex items-center gap-2">
        <Factory className="size-5 text-forge-accent" />
        <div>
          <p className="text-sm font-bold leading-tight">{title}</p>
          {user && <p className="text-[10px] leading-tight text-forge-steel">{ROLE_LABEL[user.role] ?? user.role}</p>}
        </div>
      </div>
      {user && (
        <div className="flex size-8 items-center justify-center rounded-full bg-forge-accent/15 text-xs font-bold text-forge-accent">
          {user.name.charAt(0)}
        </div>
      )}
    </header>
  );
}
