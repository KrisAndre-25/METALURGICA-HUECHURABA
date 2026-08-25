import { Contrast } from 'lucide-react';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import './switches.css';

/** Switch de alto contraste (estilo Uiverse.io: thumb metálico con conic-gradient). */
export function ContrastToggle() {
  const { highContrast, toggleHighContrast, t } = useUiPrefs();

  return (
    <div className="flex items-center gap-2">
      <Contrast className="size-3.5 shrink-0 text-forge-steel" aria-hidden="true" />
      <button
        type="button"
        role="switch"
        aria-checked={highContrast}
        aria-label={t.switches.contrastLabel}
        onClick={toggleHighContrast}
        className="metal-switch"
      >
        <span className="metal-switch__track">
          <span className="metal-switch__thumb" />
        </span>
      </button>
    </div>
  );
}
