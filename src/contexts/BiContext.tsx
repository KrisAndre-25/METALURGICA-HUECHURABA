import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BiAiAnalysis, BiKpiSnapshot, BiReport, BiReportType, StationCapacity } from '../types/bi';
import { storageService } from '../services/storageService';
import { analysisToText, generateBiAnalysis } from '../services/biAnalysisService';
import { calculateTimeStudy, defaultCapacities, monthBounds } from '../utils/timeStudyCalculators';
import { formatMonth } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { useUiPrefs } from './UiPrefsContext';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../components/ui/Toast';

const CAPACITIES_KEY = 'bi.capacities';
const REPORTS_KEY = 'bi.reports';
const LAST_CLOSED_MONTH_KEY = 'bi.lastClosedMonth';

interface SaveReportInput {
  type: BiReportType;
  kpis: BiKpiSnapshot;
  analysis: BiAiAnalysis;
}

interface BiContextValue {
  capacities: StationCapacity[];
  updateCapacities: (next: StationCapacity[]) => void;
  /** Historial archivado, más reciente primero. */
  reports: BiReport[];
  saveReport: (input: SaveReportInput) => BiReport;
}

const BiContext = createContext<BiContextValue | null>(null);

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// Evita que StrictMode (doble montaje) o un re-render dispare dos cierres del mismo mes.
let closingMonth: string | null = null;

/**
 * Estado del módulo BI — espejo local de las tablas `capacidad_estaciones` y
 * `reportes_historicos_bi` (ver supabase/migrations), persistido igual que el
 * resto de la app vía `storageService`, con sync entre pestañas.
 *
 * También ejecuta el **cierre automático de mes**: en la primera sesión de
 * ADMIN desde el día 1, si el mes anterior no tiene su "Reporte Mensual Cierre
 * de Mes", lo genera con IA y lo archiva. El dashboard activo no necesita
 * "resetearse" — siempre calcula desde el día 1 del mes en curso — y la data
 * del mes cerrado queda consultable en el historial.
 */
export function BiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { allOrders } = useOrders();
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();

  const [capacities, setCapacities] = useState<StationCapacity[]>(() => storageService.get(CAPACITIES_KEY, defaultCapacities()));
  const [reports, setReports] = useState<BiReport[]>(() => storageService.get<BiReport[]>(REPORTS_KEY, []));

  useEffect(() => {
    const offCapacities = storageService.subscribe<StationCapacity[]>(CAPACITIES_KEY, (v) => setCapacities(v ?? defaultCapacities()));
    const offReports = storageService.subscribe<BiReport[]>(REPORTS_KEY, (v) => setReports(v ?? []));
    return () => {
      offCapacities();
      offReports();
    };
  }, []);

  const updateCapacities = useCallback((next: StationCapacity[]) => {
    setCapacities(next);
    storageService.set(CAPACITIES_KEY, next);
  }, []);

  const persistReport = useCallback((report: BiReport) => {
    // Se relee del storage para no pisar un reporte guardado desde otra pestaña.
    const next = [report, ...storageService.get<BiReport[]>(REPORTS_KEY, []).filter((r) => r.id !== report.id)];
    setReports(next);
    storageService.set(REPORTS_KEY, next);
  }, []);

  const saveReport = useCallback(
    ({ type, kpis, analysis }: SaveReportInput): BiReport => {
      const report: BiReport = {
        id: `bi-${Date.now()}`,
        type,
        from: kpis.from,
        to: kpis.to,
        kpis,
        ...analysisToText(analysis, t),
        analysis,
        createdBy: user?.id ?? null,
        createdByName: user?.name ?? t.bi.systemAuthor,
        timestamp: new Date().toISOString(),
      };
      persistReport(report);
      return report;
    },
    [persistReport, t, user],
  );

  const isAdmin = user?.role === 'ADMIN';
  useEffect(() => {
    if (!isAdmin) return;
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const target = monthKey(previousMonth);
    if (closingMonth === target) return;
    const lastClosed = storageService.get<string | null>(LAST_CLOSED_MONTH_KEY, null);
    if (lastClosed !== null && lastClosed >= target) return;

    const alreadyArchived = storageService
      .get<BiReport[]>(REPORTS_KEY, [])
      .some((r) => r.type === 'CIERRE_MES' && monthKey(new Date(r.from)) === target);
    // Se "reclama" el mes antes de la llamada async, para que otra pestaña no lo duplique.
    storageService.set(LAST_CLOSED_MONTH_KEY, target);
    if (alreadyArchived) return;

    closingMonth = target;
    const { from, to } = monthBounds(previousMonth);
    const kpis = calculateTimeStudy(allOrders, capacities, from.toISOString(), to.toISOString());
    void generateBiAnalysis(kpis, language, t).then((analysis) => {
      persistReport({
        id: `bi-close-${target}`,
        type: 'CIERRE_MES',
        from: kpis.from,
        to: kpis.to,
        kpis,
        ...analysisToText(analysis, t),
        analysis,
        createdBy: null,
        createdByName: t.bi.systemAuthor,
        timestamp: new Date().toISOString(),
      });
      showToast(t.bi.autoCloseToast(formatMonth(previousMonth, language)), 'info');
    });
    // Idempotente: tras el primer cierre, la marca `lastClosedMonth` hace que las
    // re-ejecuciones (cambio de OTs, idioma, capacidad) retornen de inmediato.
  }, [isAdmin, allOrders, capacities, language, t, persistReport, showToast]);

  const value = useMemo<BiContextValue>(
    () => ({ capacities, updateCapacities, reports, saveReport }),
    [capacities, updateCapacities, reports, saveReport],
  );

  return <BiContext.Provider value={value}>{children}</BiContext.Provider>;
}

export function useBi(): BiContextValue {
  const ctx = useContext(BiContext);
  if (!ctx) throw new Error('useBi debe usarse dentro de un BiProvider');
  return ctx;
}
