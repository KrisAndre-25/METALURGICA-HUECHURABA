import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck2, PackageCheck } from 'lucide-react';
import type { Station, WorkOrder } from '../../types/order';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { ConformityCertificateSheet } from './ConformityCertificateSheet';

type MacroStage = 0 | 1 | 2 | 3;

const STAGE_STATIONS: Record<MacroStage, Station[]> = {
  0: ['ORDEN_COMPRA', 'COMPRA_INSUMOS'],
  1: ['CORTE', 'ARMADO_SOLDADURA', 'PINTURA', 'CONTROL_CALIDAD'],
  2: ['DESPACHO'],
  3: [],
};

function macroStageFor(order: WorkOrder): MacroStage {
  if (order.status === 'COMPLETADO') return 3;
  if (order.currentStation === 'DESPACHO') return 2;
  if (STAGE_STATIONS[1].includes(order.currentStation)) return 1;
  return 0;
}

/**
 * Dashboard del portal Cliente simplificado: colapsa las 7 estaciones internas a
 * 4 macro-estados y no expone datos operativos (operario, notas, historial).
 */
export function ClientMacroStatusCard({ order }: { order: WorkOrder }) {
  const { t, language } = useUiPrefs();
  const [certOpen, setCertOpen] = useState(false);
  const stage = macroStageFor(order);
  const macroLabels = t.app.clientHome.macroStages;

  return (
    <div className="rounded-2xl border border-forge-border bg-forge-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{order.projectName}</p>
          <p className="text-xs text-forge-steel">{order.id}</p>
        </div>
        {stage === 3 && <PackageCheck className="size-6 text-forge-ok" />}
      </div>

      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-forge-accent">{macroLabels[stage]}</span>
        <span className="text-sm text-forge-steel">{t.orders.clientTracking.promised} {formatDate(order.promisedDate, language)}</span>
      </div>

      <div className="relative mt-6 px-1">
        <div className="absolute left-1 right-1 top-1.5 h-0.5 bg-forge-border" />
        <motion.div
          className="absolute left-1 top-1.5 h-0.5 bg-forge-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(stage / 3) * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ maxWidth: 'calc(100% - 0.5rem)' }}
        />
        <div className="relative flex justify-between">
          {macroLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`size-3 rounded-full border-2 border-forge-bg ${i <= stage ? 'bg-forge-accent' : 'bg-forge-border'}`} />
              <span className="hidden max-w-16 text-center text-[9px] leading-tight text-forge-steel sm:block">{label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-forge-steel sm:hidden">{macroLabels[stage]}</p>

      {stage === 3 && (
        <Button
          variant="secondary"
          fullWidth
          size="md"
          className="mt-4"
          icon={<FileCheck2 className="size-4" />}
          onClick={() => setCertOpen(true)}
        >
          {t.orders.dispatch.viewCertificate}
        </Button>
      )}

      <ConformityCertificateSheet order={certOpen ? order : null} onClose={() => setCertOpen(false)} />
    </div>
  );
}
