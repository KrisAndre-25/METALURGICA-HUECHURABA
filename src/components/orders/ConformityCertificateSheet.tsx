import { Download } from 'lucide-react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import type { WorkOrder } from '../../types/order';
import { formatDate, formatDateTime, formatDispatchGuide, formatTons } from '../../utils/formatters';

function buildCertificateText(order: WorkOrder, exitTimestamp: string | null): string {
  return [
    'FICHA DE CONFORMIDAD DE ENTREGA',
    'Metalúrgica Huechuraba',
    '─'.repeat(40),
    `Orden de Fabricación: ${order.id}`,
    `Orden de Compra: ${order.purchaseOrderId}`,
    `Guía de despacho: ${formatDispatchGuide(order.id)}`,
    '',
    `Cliente: ${order.clientName}`,
    `Proyecto: ${order.projectName}`,
    '',
    'ESPECIFICACIONES',
    `  Estructura: ${order.productSpecs.structureType}`,
    `  Dimensiones: ${order.productSpecs.dimensions}`,
    `  Peso: ${formatTons(order.productSpecs.weightTons)}`,
    `  Pintura: ${order.productSpecs.paintSpecification}`,
    '',
    `Fecha de pedido: ${formatDate(order.orderDate)}`,
    `Fecha comprometida: ${formatDate(order.promisedDate)}`,
    `Salida de taller: ${exitTimestamp ? formatDateTime(exitTimestamp) : 'Pendiente'}`,
    '',
    'Este documento certifica que la estructura fabricada bajo la presente',
    'orden fue inspeccionada en Control de Calidad y despachada conforme',
    'a las especificaciones acordadas.',
    '─'.repeat(40),
    'Documento generado automáticamente — entorno de demostración.',
  ].join('\n');
}

export function ConformityCertificateSheet({ order, onClose }: { order: WorkOrder | null; onClose: () => void }) {
  const exitEvent = order?.history.find((e) => e.station === 'DESPACHO' && e.type === 'STATION_EXIT');
  const exitTimestamp = exitEvent?.timestamp ?? null;

  const handleDownload = () => {
    if (!order) return;
    const blob = new Blob([buildCertificateText(order, exitTimestamp)], { type: 'text/plain;charset=utf-8' });
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
    <BottomSheet open={order !== null} onClose={onClose} title="Ficha de Conformidad" subtitle={order ? `${order.id} · ${order.projectName}` : undefined}>
      {order && (
        <>
          <div className="mb-4 rounded-xl border border-forge-border bg-forge-surface-2 p-4">
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-forge-steel">
              {buildCertificateText(order, exitTimestamp)}
            </pre>
          </div>
          <Button fullWidth size="lg" icon={<Download className="size-4" />} onClick={handleDownload}>
            Descargar Ficha de Conformidad
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
