import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language } from '../types/language';
import { STRINGS, type Strings } from '../i18n/strings';
import { storageService } from '../services/storageService';

const HIGH_CONTRAST_KEY = 'uiPrefs.highContrast';
const LANGUAGE_KEY = 'uiPrefs.language';

interface UiPrefsContextValue {
  highContrast: boolean;
  toggleHighContrast: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Strings;
}

const UiPrefsContext = createContext<UiPrefsContextValue | null>(null);

export function UiPrefsProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(() => storageService.get(HIGH_CONTRAST_KEY, false));
  const [language, setLanguageState] = useState<Language>(() => storageService.get<Language>(LANGUAGE_KEY, 'es'));

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleHighContrast = () => {
    setHighContrast((prev) => {
      const next = !prev;
      storageService.set(HIGH_CONTRAST_KEY, next);
      return next;
    });
  };

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    storageService.set(LANGUAGE_KEY, next);
  };

  const toggleLanguage = () => setLanguage(language === 'es' ? 'en' : 'es');

  const value = useMemo<UiPrefsContextValue>(
    () => ({ highContrast, toggleHighContrast, language, setLanguage, toggleLanguage, t: STRINGS[language] }),
    [highContrast, language],
  );

  return <UiPrefsContext.Provider value={value}>{children}</UiPrefsContext.Provider>;
}

export function useUiPrefs(): UiPrefsContextValue {
  const ctx = useContext(UiPrefsContext);
  if (!ctx) throw new Error('useUiPrefs debe usarse dentro de un UiPrefsProvider');
  return ctx;
}
