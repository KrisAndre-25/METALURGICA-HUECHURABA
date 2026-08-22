import type { PurchaseOrder, PurchaseOrderStatus } from '../types/order';

export interface CsvImportResult<T> {
  rows: T[];
  errors: string[];
}

/** Parser CSV minimalista: separador coma, primera fila = encabezados, sin soporte de comillas anidadas. */
function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.trim().split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    return headers.reduce<Record<string, string>>((row, header, i) => {
      row[header] = cells[i] ?? '';
      return row;
    }, {});
  });
}

const VALID_PO_STATUS: PurchaseOrderStatus[] = ['RECIBIDA', 'EN_PRODUCCION', 'COMPLETADA'];

/**
 * Importa Órdenes de Compra desde un CSV con columnas:
 * id,clientName,clientRut,issuedDate,totalAmountUF,status
 */
export function importPurchaseOrdersFromCsv(raw: string): CsvImportResult<PurchaseOrder> {
  const rows = parseCsv(raw);
  const result: CsvImportResult<PurchaseOrder> = { rows: [], errors: [] };

  rows.forEach((row, index) => {
    const lineNumber = index + 2; // +1 por encabezado, +1 por índice base 1
    const totalAmountUF = Number(row.totalAmountUF);
    const status = row.status as PurchaseOrderStatus;

    if (!row.id || !row.clientName || !row.clientRut || !row.issuedDate) {
      result.errors.push(`Línea ${lineNumber}: faltan campos obligatorios.`);
      return;
    }
    if (Number.isNaN(totalAmountUF)) {
      result.errors.push(`Línea ${lineNumber}: totalAmountUF inválido ("${row.totalAmountUF}").`);
      return;
    }
    if (!VALID_PO_STATUS.includes(status)) {
      result.errors.push(`Línea ${lineNumber}: status inválido ("${row.status}").`);
      return;
    }

    result.rows.push({
      id: row.id,
      clientName: row.clientName,
      clientRut: row.clientRut,
      issuedDate: row.issuedDate,
      totalAmountUF,
      status,
    });
  });

  return result;
}
