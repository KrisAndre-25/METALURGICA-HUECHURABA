/**
 * Exporta una tabla como CSV descargable (compatible con Excel — separador `;`,
 * el que usan las configuraciones regionales es-CL/es-* de Excel, con BOM UTF-8
 * para que las tildes se vean bien al abrirlo).
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const BOM = '﻿';
  const escapeCell = (value: string | number): string => {
    const str = String(value);
    return /[",;\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(';'));
  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
