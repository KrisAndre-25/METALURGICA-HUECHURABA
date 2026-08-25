import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import type { WorkOrder } from '../../types/order';
import type { Language } from '../../types/language';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatDate, formatDateTime, formatDispatchGuide, formatTons } from '../../utils/formatters';
import type { Strings } from '../../i18n/strings';

function buildCertificateText(order: WorkOrder, exitTimestamp: string | null, t: Strings, language: Language): string {
  const c = t.orders.conformity;
  return [
    c.header,
    c.company,
    '─'.repeat(40),
    `${c.workOrder}: ${order.id}`,
    `${c.purchaseOrder}: ${order.purchaseOrderId}`,
    `${c.guide}: ${formatDispatchGuide(order.id)}`,
    '',
    `${c.client}: ${order.clientName}`,
    `${c.project}: ${order.projectName}`,
    '',
    c.specsHeader,
    `  ${c.structure}: ${order.productSpecs.structureType}`,
    `  ${c.dimensions}: ${order.productSpecs.dimensions}`,
    `  ${c.weight}: ${formatTons(order.productSpecs.weightTons)}`,
    `  ${c.paint}: ${order.productSpecs.paintSpecification}`,
    '',
    `${c.orderDate}: ${formatDate(order.orderDate, language)}`,
    `${c.promisedDate}: ${formatDate(order.promisedDate, language)}`,
    `${c.exitDate}: ${exitTimestamp ? formatDateTime(exitTimestamp, language) : c.pending}`,
    '',
    c.certifyText,
    '─'.repeat(40),
    c.generatedNote,
  ].join('\n');
}

/**
 * `<a download>` con un Blob de texto plano no es confiable en navegadores
 * móviles (Safari iOS y varios WebViews lo abren inline o simplemente no
 * hacen nada, en vez de guardar el archivo) — jsPDF arma el PDF completo en
 * memoria y usa el mismo mecanismo de guardado que ya manejan de forma
 * nativa los visores de PDF del sistema operativo.
 */
function buildCertificatePdf(order: WorkOrder, exitTimestamp: string | null, t: Strings, language: Language): jsPDF {
  const c = t.orders.conformity;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 24;

  const field = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, marginX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, marginX + 55, y);
    y += 7;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(c.header, pageWidth / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(c.company, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setDrawColor(180);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  doc.setFontSize(10);
  field(c.workOrder, order.id);
  field(c.purchaseOrder, order.purchaseOrderId);
  field(c.guide, formatDispatchGuide(order.id));
  y += 3;
  field(c.client, order.clientName);
  field(c.project, order.projectName);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(c.specsHeader, marginX, y);
  y += 8;
  doc.setFontSize(10);
  field(c.structure, order.productSpecs.structureType);
  field(c.dimensions, order.productSpecs.dimensions);
  field(c.weight, formatTons(order.productSpecs.weightTons));
  field(c.paint, order.productSpecs.paintSpecification);
  y += 5;

  field(c.orderDate, formatDate(order.orderDate, language));
  field(c.promisedDate, formatDate(order.promisedDate, language));
  field(c.exitDate, exitTimestamp ? formatDateTime(exitTimestamp, language) : c.pending);
  y += 8;

  doc.setDrawColor(180);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const certifyLines = doc.splitTextToSize(c.certifyText.replace(/\n/g, ' '), pageWidth - marginX * 2);
  doc.text(certifyLines, marginX, y);
  y += certifyLines.length * 5 + 10;

  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(c.generatedNote, marginX, y);

  return doc;
}

export function ConformityCertificateSheet({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  const { t, language } = useUiPrefs();
  const exitEvent = order?.history.find((e) => e.station === 'DESPACHO' && e.type === 'STATION_EXIT');
  const exitTimestamp = exitEvent?.timestamp ?? null;

  const handleDownload = () => {
    if (!order) return;
    const doc = buildCertificatePdf(order, exitTimestamp, t, language);
    doc.save(`Ficha-Conformidad-${order.id}.pdf`);
  };

  return (
    <BottomSheet open={order !== null} onClose={onClose} title={t.orders.conformity.title} subtitle={order ? `${order.id} · ${order.projectName}` : undefined}>
      {order && (
        <>
          <div className="mb-4 rounded-xl border border-forge-border bg-forge-surface-2 p-4">
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-forge-steel">
              {buildCertificateText(order, exitTimestamp, t, language)}
            </pre>
          </div>
          <Button fullWidth size="lg" icon={<Download className="size-4" />} onClick={handleDownload}>
            {t.orders.conformity.download}
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
