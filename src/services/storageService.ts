const NAMESPACE = 'dmaix';

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

  /** Borra todo lo persistido por la app (namespace `dmaix:`), sin tocar otros datos del navegador. */
  clearAll(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`${NAMESPACE}:`))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // noop: entorno sin storage disponible
    }
  },

  /**
   * Sincronización reactiva entre pestañas/ventanas: el evento `storage` del navegador
   * solo se dispara en pestañas DISTINTAS a la que escribió el valor (la propia pestaña
   * ya se actualiza vía React state). Útil para que, por ejemplo, un OPERATOR avanzando
   * una OT en una pestaña se refleje de inmediato en el dashboard de un ADMIN abierto en otra.
   * Devuelve una función para des-suscribirse.
   */
  subscribe<T>(name: string, onChange: (value: T | null) => void): () => void {
    const fullKey = key(name);
    const handler = (e: StorageEvent) => {
      if (e.key !== fullKey) return;
      try {
        onChange(e.newValue ? (JSON.parse(e.newValue) as T) : null);
      } catch {
        onChange(null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },
};
