import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Red de seguridad para toda la app: sin esto, cualquier error de render (por
 * ejemplo datos de una versión anterior guardados en localStorage con una forma
 * que el código actual ya no espera) desmonta todo React y deja solo el fondo
 * oscuro visible — la "pantalla negra" sin ningún mensaje ni forma de salir.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ForgeFlow] Error de render capturado por ErrorBoundary:', error, info.componentStack);
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

    return (
      <div className="flex min-h-svh items-center justify-center bg-forge-bg px-4">
        <div className="w-full max-w-sm rounded-2xl border border-forge-stopped/30 bg-forge-surface p-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-forge-stopped/15">
            <AlertTriangle className="size-6 text-forge-stopped" />
          </div>
          <h1 className="mb-1 text-base font-bold">Algo falló al mostrar esta pantalla</h1>
          <p className="mb-5 text-sm text-forge-steel">
            Puede ser un dato de prueba guardado de una versión anterior. Prueba recargar; si el
            problema sigue, restablece los datos de demo (esto no afecta a nadie más, es solo local
            en este navegador).
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forge-accent text-sm font-semibold text-white"
            >
              <RotateCcw className="size-4" /> Recargar
            </button>
            <button
              type="button"
              onClick={this.handleResetData}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-forge-border text-sm font-semibold text-forge-steel"
            >
              <Trash2 className="size-4" /> Restablecer datos de demo
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
