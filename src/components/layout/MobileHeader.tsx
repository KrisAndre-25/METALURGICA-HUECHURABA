import { useAuth } from '../../contexts/AuthContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatRole } from '../../utils/formatters';
import { ContrastToggle } from '../ui/ContrastToggle';
import { LanguageToggle } from '../ui/LanguageToggle';

export function MobileHeader({ title }: { title: string }) {
  const { user } = useAuth();
  const { language } = useUiPrefs();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-forge-border bg-forge-surface/95 px-4 py-3 backdrop-blur sm:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <img src="/icono_software.png" alt="DMAIX" className="size-5 shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight">{title}</p>
          {user && <p className="truncate text-[10px] leading-tight text-forge-steel">{formatRole(user.role, language)}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ContrastToggle />
        <LanguageToggle />
        {user && (
          <div className="flex size-8 items-center justify-center rounded-full bg-forge-accent/15 text-xs font-bold text-forge-accent">
            {user.name.charAt(0)}
          </div>
        )}
      </div>
    </header>
  );
}
