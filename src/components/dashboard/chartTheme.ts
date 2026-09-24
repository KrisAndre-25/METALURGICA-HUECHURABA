/**
 * Recharts aplica `contentStyle`/`tick`/`stroke` como estilos inline (o
 * atributos SVG `fill`/`stroke`), no como clases — un `!important` en CSS
 * puede ganarle a un inline style, pero es frágil y no vale la pena
 * cuando el propio componente ya sabe qué tema está activo. Se calculan
 * los colores del tooltip/ejes/grid aquí, según `highContrast`, en vez de
 * depender de que el texto herede el color del body (eso es justo lo que
 * los dejaba negro-sobre-negro en alto contraste: el fondo del tooltip
 * seguía fijo y oscuro, pero el texto pasaba a negro por herencia).
 */
export function useChartTheme(highContrast: boolean) {
  return highContrast
    ? {
        tooltipBg: '#000000',
        tooltipBorder: '#ffffff',
        tooltipText: '#ffffff',
        axisFill: '#000000',
        gridStroke: '#000000',
        cursorFill: 'rgba(0, 0, 0, 0.12)',
      }
    : {
        tooltipBg: '#1e293b',
        tooltipBorder: '#475569',
        tooltipText: '#f8fafc',
        axisFill: '#94a3b8',
        gridStroke: '#475569',
        cursorFill: '#334155',
      };
}
