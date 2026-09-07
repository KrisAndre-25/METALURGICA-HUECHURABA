const ROWS = Array.from({ length: 10 });
const COLS = Array.from({ length: 24 });

/**
 * Grilla de celdas que se iluminan en cian al pasar el mouse, con una
 * máscara radial que las desvanece hacia los bordes — estilo Aceternity UI
 * `BackgroundBoxes` (`Boxes`), reimplementado en CSS puro (sin JS por celda)
 * para no pagar el costo de ~240 listeners individuales.
 */
export function BackgroundBoxes() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)]"
      aria-hidden="true"
    >
      <div className="pointer-events-auto grid -rotate-6 scale-125" style={{ transformStyle: 'preserve-3d' }}>
        {ROWS.map((_, r) => (
          <div key={r} className="flex">
            {COLS.map((_, c) => (
              <div
                key={c}
                className="size-8 shrink-0 border border-blue-900/30 transition-colors duration-150 hover:bg-blue-500/40"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
