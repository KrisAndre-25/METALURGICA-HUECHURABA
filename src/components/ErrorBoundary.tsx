import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Language } from '../types/language';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

const COPY: Record<Language, { title: string; body: string; reload: string; reset: string }> = {
  es: {
    title: 'Algo falló al mostrar esta pantalla',
    body:
      'Puede ser un dato de prueba guardado de una versión anterior. Prueba recargar; si el ' +
      'problema sigue, restablece los datos de demo (esto no afecta a nadie más, es solo local ' +
      'en este navegador).',
    reload: 'Recargar',
    reset: 'Restablecer datos de demo',
  },
  en: {
    title: 'Something failed while showing this screen',
    body:
      'It may be test data saved from an older version. Try reloading; if the problem persists, ' +
      'reset the demo data (this only affects you, locally in this browser).',
    reload: 'Reload',
    reset: 'Reset demo data',
  },
};

/**
 * Red de seguridad para toda la app: sin esto, cualquier error de render (por
 * ejemplo datos de una versión anterior guardados en localStorage con una forma
 * que el código actual ya no espera) desmonta todo React y deja solo el fondo
 * oscuro visible — la "pantalla negra" sin ningún mensaje ni forma de salir.
 *
 * Vive FUERA de todos los providers (envuelve <App/> en main.tsx), así que no
 * puede usar useUiPrefs(): lee el idioma directo de localStorage.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[DMAIX] Error de render capturado por ErrorBoundary:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  handleResetData = () => {
    storageService.clearAll();
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const language = storageService.get<Language>('uiPrefs.language', 'es');
    const copy = COPY[language];

    return (
      <div className="flex min-h-svh items-center justify-center bg-forge-bg px-4">
        <div className="w-full max-w-sm rounded-2xl border border-forge-stopped/30 bg-forge-surface p-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-forge-stopped/15">
            <AlertTriangle className="size-6 text-forge-stopped" />
          </div>
          <h1 className="mb-1 text-base font-bold">{copy.title}</h1>
          <p className="mb-5 text-sm text-forge-steel">{copy.body}</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forge-accent text-sm font-semibold text-white"
            >
              <RotateCcw className="size-4" /> {copy.reload}
            </button>
            <button
              type="button"
              onClick={this.handleResetData}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-forge-border text-sm font-semibold text-forge-steel"
            >
              <Trash2 className="size-4" /> {copy.reset}
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-forge-bg p-2 text-left text-[10px] text-forge-stopped">
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
