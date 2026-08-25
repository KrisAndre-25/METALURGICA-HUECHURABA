import { useUiPrefs } from '../../contexts/UiPrefsContext';
import './switches.css';

/** Switch ES/EN (estilo Uiverse.io: thumb metálico con conic-gradient), con etiquetas visibles a los lados. */
export function LanguageToggle() {
  const { language, toggleLanguage, t } = useUiPrefs();
  const checked = language === 'en';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={t.switches.languageLabel}
      onClick={toggleLanguage}
      className="metal-switch metal-switch--lang"
    >
      <span className="metal-switch__track">
        <span className="metal-switch__lang-label metal-switch__lang-label--es">ES</span>
        <span className="metal-switch__lang-label metal-switch__lang-label--en">EN</span>
        <span className="metal-switch__thumb" />
      </span>
    </button>
  );
}
