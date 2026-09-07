import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type LandingLanguage = 'es' | 'en';

interface LandingLanguageContextValue {
  language: LandingLanguage;
  toggleLanguage: () => void;
}

const LandingLanguageContext = createContext<LandingLanguageContextValue | null>(null);

const STORAGE_KEY = 'dmaix-landing-language';

function readStoredLanguage(): LandingLanguage {
  return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
}

/**
 * Idioma de la landing (ES/EN) — solo cubre la landing pública, independiente
 * del resto de la app (que sigue en español fijo). Persiste en localStorage.
 */
export function LandingLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LandingLanguage>(readStoredLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => setLanguage((current) => (current === 'es' ? 'en' : 'es'));

  return <LandingLanguageContext.Provider value={{ language, toggleLanguage }}>{children}</LandingLanguageContext.Provider>;
}

export function useLandingLanguage() {
  const ctx = useContext(LandingLanguageContext);
  if (!ctx) throw new Error('useLandingLanguage debe usarse dentro de LandingLanguageProvider');
  return ctx;
}
