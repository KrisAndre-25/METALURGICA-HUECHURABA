import { motion } from 'framer-motion';
import { AlertOctagon, Info, TriangleAlert } from 'lucide-react';
import type { DiagnosticInsight, DiagnosticSeverity } from '../../types/kpi';
import { cn } from '../ui/cn';

const SEVERITY_CONFIG: Record<DiagnosticSeverity, { icon: typeof Info; classes: string }> = {
  critical: { icon: AlertOctagon, classes: 'border-forge-stopped/30 bg-forge-stopped/10 text-forge-stopped' },
  warning: { icon: TriangleAlert, classes: 'border-forge-warn/30 bg-forge-warn/10 text-forge-warn' },
  info: { icon: Info, classes: 'border-forge-ok/30 bg-forge-ok/10 text-forge-ok' },
};

/** Tarjeta con recomendaciones en lenguaje natural generadas por el motor de diagnóstico. */
export function DiagnosticBanner({ insights }: { insights: DiagnosticInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {insights.map((insight, i) => {
        const { icon: Icon, classes } = SEVERITY_CONFIG[insight.severity];
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn('flex gap-3 rounded-xl border p-4', classes)}
          >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">{insight.title}</p>
              <p className="mt-0.5 text-xs text-forge-steel">{insight.message}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
