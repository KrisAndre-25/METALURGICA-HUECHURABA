import { useState } from 'react';
import { Bot, Cpu, Eye, FileDown, FileSpreadsheet } from 'lucide-react';
import type { BiReport } from '../../types/bi';
import { useBi } from '../../contexts/BiContext';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { useToast } from '../ui/Toast';
import { exportBiReportCsv, exportBiReportPdf } from '../../utils/biReportExport';
import { formatDate, formatDateTime, formatShiftHours, formatStation } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { cn } from '../ui/cn';
import { AiReportContent } from './AiReportContent';

function ExportButtons({ report }: { report: BiReport }) {
  const { t, language } = useUiPrefs();
  const { showToast } = useToast();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<FileDown className="size-3.5" />}
        onClick={() => {
          exportBiReportPdf(report, t, language);
          showToast(t.bi.exportedToast);
        }}
      >
        {t.bi.exportPdf}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={<FileSpreadsheet className="size-3.5" />}
        onClick={() => {
          exportBiReportCsv(report, t, language);
          showToast(t.bi.exportedToast);
        }}
      >
        {t.bi.exportCsv}
      </Button>
    </>
  );
}

function ReportDetailModal({ report, onClose }: { report: BiReport | null; onClose: () => void }) {
  const { t, language } = useUiPrefs();
  const h = (n: number) => formatShiftHours(n, language);

  return (
    <Modal open={report !== null} onClose={onClose} title={report ? `${t.bi.typeLabels[report.type]} · ${formatDate(report.from, language)} – ${formatDate(report.to, language)}` : ''}>
      {report && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {[
              [t.bi.kpiOee, `${report.kpis.oeePct}%`],
              [t.bi.kpiStaff, `${report.kpis.staffUtilizationPct}%`],
              [t.bi.kpiIdle, h(report.kpis.totalIdleHours)],
              [t.bi.kpiStopped, h(report.kpis.totalStoppedHours)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-forge-border bg-forge-surface-2 p-3">
                <p className="text-forge-steel">{label}</p>
                <p className="text-base font-bold text-slate-100">{value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-forge-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-forge-surface-2 text-forge-steel">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">{t.bi.columnStation}</th>
                  <th className="px-2.5 py-2 font-semibold">{t.bi.seriesWorked}</th>
                  <th className="px-2.5 py-2 font-semibold">{t.bi.seriesStopped}</th>
                  <th className="px-2.5 py-2 font-semibold">{t.bi.seriesIdle}</th>
                  <th className="px-2.5 py-2 font-semibold">%</th>
                </tr>
              </thead>
              <tbody>
                {report.kpis.stations.map((s) => (
                  <tr key={s.station} className="border-t border-forge-border">
                    <td className="px-2.5 py-2 font-medium text-slate-100">{formatStation(s.station, language)}</td>
                    <td className="px-2.5 py-2 text-forge-steel">{h(s.workedHours)}</td>
                    <td className="px-2.5 py-2 text-forge-steel">{h(s.stoppedHours)}</td>
                    <td className="px-2.5 py-2 text-forge-steel">{h(s.idleHours)}</td>
                    <td className="px-2.5 py-2 font-semibold text-slate-100">{s.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AiReportContent analysis={report.analysis} />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-forge-border pt-3">
            <p className="text-[11px] text-forge-steel">
              {formatDateTime(report.timestamp, language)} · {t.bi.historyBy(report.createdByName)}
            </p>
            <div className="flex gap-1">
              <ExportButtons report={report} />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Reportes archivados (`reportes_historicos_bi`), más recientes primero, con detalle y exportación. */
export function ReportHistory() {
  const { reports } = useBi();
  const { t, language } = useUiPrefs();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = reports.find((r) => r.id === selectedId) ?? null;

  if (reports.length === 0) {
    return (
      <Card>
        <p className="py-4 text-center text-sm text-forge-steel">{t.bi.historyEmpty}</p>
      </Card>
    );
  }

  return (
    <>
      <Card noPadding>
        <ul className="divide-y divide-forge-border">
          {reports.map((report) => (
            <li key={report.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      report.type === 'CIERRE_MES' ? 'bg-forge-ok/10 text-forge-ok' : 'bg-forge-accent/10 text-forge-accent',
                    )}
                  >
                    {t.bi.typeLabels[report.type]}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {formatDate(report.from, language)} – {formatDate(report.to, language)}
                  </span>
                  {report.analysis.source !== 'local' ? (
                    <Bot className="size-3.5 text-forge-ok" aria-label={report.analysis.source === 'gemini' ? t.bi.sourceGemini : t.bi.sourceClaude} />
                  ) : (
                    <Cpu className="size-3.5 text-forge-warn" aria-label={t.bi.sourceLocal} />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-forge-steel">
                  OEE {report.kpis.oeePct}% · {formatDateTime(report.timestamp, language)} · {t.bi.historyBy(report.createdByName)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="secondary" size="sm" icon={<Eye className="size-3.5" />} onClick={() => setSelectedId(report.id)}>
                  {t.bi.view}
                </Button>
                <ExportButtons report={report} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <ReportDetailModal report={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
