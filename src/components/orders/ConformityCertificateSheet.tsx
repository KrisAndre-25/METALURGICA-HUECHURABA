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

export function ConformityCertificateSheet({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  const { t, language } = useUiPrefs();
  const exitEvent = order?.history.find((e) => e.station === 'DESPACHO' && e.type === 'STATION_EXIT');
  const exitTimestamp = exitEvent?.timestamp ?? null;

  const handleDownload = () => {
    if (!order) return;
    const blob = new Blob([buildCertificateText(order, exitTimestamp, t, language)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ficha-Conformidad-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
