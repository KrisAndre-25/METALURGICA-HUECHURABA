const NAMESPACE = 'forgeflow';

function key(name: string): string {
  return `${NAMESPACE}:${name}`;
}

/** Wrapper sobre localStorage: nunca lanza (entorno sin storage, cuota llena, etc.), solo degrada. */
export const storageService = {
  get<T>(name: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(name));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(name: string, value: T): boolean {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(name: string): void {
    try {
      localStorage.removeItem(key(name));
    } catch {
      // noop: entorno sin storage disponible
    }
  },

  /** Borra todo lo persistido por la app (namespace `forgeflow:`), sin tocar otros datos del navegador. */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`${NAMESPACE}:`))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // noop: entorno sin storage disponible
    }
  },
};
