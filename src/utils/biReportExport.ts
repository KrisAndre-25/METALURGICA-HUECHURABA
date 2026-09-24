import { jsPDF } from 'jspdf';
import type { BiReport } from '../types/bi';
import type { Language } from '../types/language';
import type { Strings } from '../i18n/strings';
import { downloadCsv } from './csvExport';
import { formatDate, formatDateTime, formatStation } from './formatters';

function fileBase(report: BiReport): string {
  return `reporte-bi-${report.type.toLowerCase()}-${report.from.slice(0, 10)}_${report.to.slice(0, 10)}`;
}

function kpiRows(report: BiReport, t: Strings): [string, string][] {
  const k = report.kpis;
  return [
    [t.bi.kpiOee, `${k.oeePct}% (${t.bi.kpiOeeHint(k.availabilityPct, k.performancePct, k.qualityPct)})`],
    [t.bi.kpiStaff, `${k.staffUtilizationPct}%`],
    [t.bi.columnAvailable, `${k.totalAvailableHours} h`],
    [t.bi.columnWorked, `${k.totalWorkedHours} h`],
    [t.bi.columnStopped, `${k.totalStoppedHours} h`],
    [t.bi.columnIdle, `${k.totalIdleHours} h`],
  ];
}

/** Excel/CSV: KPIs, tabla por estación y las 4 secciones del análisis, en una sola hoja. */
export function exportBiReportCsv(report: BiReport, t: Strings, language: Language): void {
  const { analysis, kpis } = report;
  const rows: (string | number)[][] = [
    [t.bi.typeLabels[report.type], t.bi.periodLabel(formatDate(report.from, language), formatDate(report.to, language))],
    [],
    ...kpiRows(report, t),
    [],
    [t.bi.columnStation, t.bi.columnOperators, t.bi.columnAvailable, t.bi.columnWorked, t.bi.columnStopped, t.bi.columnIdle, t.bi.columnUtilization],
    ...kpis.stations.map((s) => [
      formatStation(s.station, language),
      s.operators,
      s.availableHours,
      s.workedHours,
      s.stoppedHours,
      s.idleHours,
      s.utilizationPct,
    ]),
    [],
    [t.bi.sectionSummary],
    [analysis.executiveSummary],
    [],
    [t.bi.sectionBottlenecks],
    ...analysis.bottlenecksAndIdle.map((l) => [l]),
    [],
    [t.bi.sectionStaffing],
    ...analysis.staffReorganization.map((l) => [l]),
    [],
    [t.bi.sectionRootCause],
    ...analysis.rootCauseAnalysis.map((l) => [l]),
  ];
  downloadCsv(`${fileBase(report)}.csv`, [t.bi.pdfTitle, t.bi.pdfCompany], rows);
}

/** PDF A4 con el mismo estilo sobrio que la Ficha de Conformidad. */
export function exportBiReportPdf(report: BiReport, t: Strings, language: Language): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  let y = 20;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 20;
    }
  };

  const heading = (text: string) => {
    ensureSpace(12);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 116, 144); // Cian oscuro DMAIX, legible impreso
    doc.text(text, marginX, y);
    doc.setTextColor(0);
    y += 6;
  };

  const paragraph = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const lines: string[] = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, marginX + indent, y);
      y += 4.6;
    }
  };

  const bullets = (items: string[]) => {
    for (const item of items) {
      ensureSpace(5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('•', marginX + 1, y);
      paragraph(item, 5);
      y += 1;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(t.bi.pdfTitle, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`${t.bi.pdfCompany} · ${t.bi.typeLabels[report.type]}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(9.5);
  doc.text(t.bi.periodLabel(formatDate(report.from, language), formatDate(report.to, language)), pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setDrawColor(180);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 4;

  heading(t.bi.pdfKpis);
  doc.setFontSize(9.5);
  for (const [label, value] of kpiRows(report, t)) {
    ensureSpace(5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginX + 62, y);
    y += 5;
  }

  heading(t.bi.pdfStations);
  const cols = [t.bi.columnStation, t.bi.columnOperators, t.bi.seriesAvailable, t.bi.seriesWorked, t.bi.seriesStopped, t.bi.seriesIdle, '%'];
  const colX = [0, 48, 66, 90, 118, 140, 162].map((x) => marginX + x);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  cols.forEach((c, i) => doc.text(c, colX[i], y));
  y += 5;
  doc.setFont('helvetica', 'normal');
  for (const s of report.kpis.stations) {
    ensureSpace(5);
    const cells = [formatStation(s.station, language), String(s.operators), `${s.availableHours} h`, `${s.workedHours} h`, `${s.stoppedHours} h`, `${s.idleHours} h`, `${s.utilizationPct}%`];
    cells.forEach((c, i) => doc.text(c, colX[i], y));
    y += 4.8;
  }

  heading(t.bi.sectionSummary);
  paragraph(report.analysis.executiveSummary);
  heading(t.bi.sectionBottlenecks);
  bullets(report.analysis.bottlenecksAndIdle);
  heading(t.bi.sectionStaffing);
  bullets(report.analysis.staffReorganization);
  heading(t.bi.sectionRootCause);
  bullets(report.analysis.rootCauseAnalysis);

  ensureSpace(10);
  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(140);
  const source = report.analysis.source === 'gemini' ? t.bi.sourceGemini : report.analysis.source === 'claude' ? t.bi.sourceClaude : t.bi.sourceLocal;
  doc.text(`${t.bi.pdfGenerated(formatDateTime(report.timestamp, language), report.createdByName)} · ${source}`, marginX, y);

  doc.save(`${fileBase(report)}.pdf`);
}
