import { Download } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useOrders } from '../../hooks/useOrders';
import { useToast } from '../ui/Toast';
import { getDowntimeRecords, summarizeDowntimeHoursByReason, summarizeDowntimeHoursByStation } from '../../utils/kpiCalculators';
import { formatDateTime, formatDelayReason, formatHours, formatStation } from '../../utils/formatters';
import { downloadCsv } from '../../utils/csvExport';

interface StopReportsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Informes de Paradas": un registro completo por parada (OT, estación, inicio/término,
 * causa, horas exactas y acción correctiva) más los KPIs consolidados de horas perdidas
 * por estación y por causa — y el botón para descargarlo como Excel/CSV.
 */
export function StopReportsModal({ open, onClose }: StopReportsModalProps) {
  const { allOrders } = useOrders();
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();

  const records = getDowntimeRecords(allOrders);
  const hoursByStation = summarizeDowntimeHoursByStation(records);
  const hoursByReason = summarizeDowntimeHoursByReason(records);

  const handleDownload = () => {
    const headers = [
      t.stopReports.columnOrder,
      t.stopReports.columnStation,
      t.stopReports.columnStart,
      t.stopReports.columnEnd,
      t.stopReports.columnCause,
      t.stopReports.columnHours,
      t.stopReports.columnCorrectiveAction,
    ];
    const rows = records.map((r) => [
      r.orderId,
      formatStation(r.station, language),
      formatDateTime(r.startTime, language),
      r.endTime ? formatDateTime(r.endTime, language) : t.stopReports.ongoing,
      formatDelayReason(r.reason, language),
      r.hours.toFixed(1),
      r.correctiveAction ?? t.stopReports.noCorrectiveAction,
    ]);
    downloadCsv(`informe-paradas-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast(t.stopReports.downloadedToast);
  };

  return (
    <Modal open={open} onClose={onClose} title={t.stopReports.title}>
      <div className="space-y-4">
        <Button fullWidth size="lg" icon={<Download className="size-4" />} onClick={handleDownload} disabled={records.length === 0}>
          {t.stopReports.downloadExcel}
        </Button>

        {records.length === 0 ? (
          <p className="py-4 text-center text-sm text-forge-steel">{t.stopReports.empty}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-forge-border bg-forge-surface-2 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">{t.stopReports.kpiHoursByStation}</p>
                <ul className="space-y-1 text-sm">
                  {hoursByStation.map((s) => (
                    <li key={s.station} className="flex items-center justify-between gap-2">
                      <span className="text-forge-steel">{formatStation(s.station, language)}</span>
                      <span className="font-semibold text-slate-100">{formatHours(s.hours, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-forge-border bg-forge-surface-2 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forge-steel">{t.stopReports.kpiHoursByCause}</p>
                <ul className="space-y-1 text-sm">
                  {hoursByReason.map((r) => (
                    <li key={r.reason} className="flex items-center justify-between gap-2">
                      <span className="text-forge-steel">{formatDelayReason(r.reason, language)}</span>
                      <span className="font-semibold text-slate-100">{formatHours(r.hours, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-forge-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-forge-surface-2 text-forge-steel">
                  <tr>
                    <th className="px-2.5 py-2 font-semibold">{t.stopReports.columnOrder}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.stopReports.columnStation}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.stopReports.columnCause}</th>
                    <th className="px-2.5 py-2 font-semibold">{t.stopReports.columnHours}</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={`${r.orderId}-${r.startTime}-${i}`} className="border-t border-forge-border">
                      <td className="px-2.5 py-2 font-medium text-slate-100">{r.orderId}</td>
                      <td className="px-2.5 py-2 text-forge-steel">{formatStation(r.station, language)}</td>
                      <td className="px-2.5 py-2 text-forge-steel">{formatDelayReason(r.reason, language)}</td>
                      <td className="px-2.5 py-2 font-semibold text-slate-100">{formatHours(r.hours, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
