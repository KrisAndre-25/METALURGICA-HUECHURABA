import { AnimatePresence, motion } from 'framer-motion';
import {
  IconAlertTriangle,
  IconClipboardList,
  IconCut,
  IconGauge,
  IconSpray,
  IconTools,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useLandingLanguage, type LandingLanguage } from '../../contexts/LandingLanguageContext';

type Tone = 'ok' | 'stopped' | 'warn';

const TONE_BADGE: Record<Tone, string> = {
  ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  stopped: 'bg-red-500/10 text-red-400 border-red-500/30',
  warn: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

const TONE_DOT: Record<Tone, string> = { ok: 'bg-emerald-400', stopped: 'bg-red-400', warn: 'bg-amber-400' };

interface OrderRow {
  id: string;
  name: string;
  station: string;
  tone: Tone;
}

type StationId = 'Corte' | 'Armado' | 'Pintura';
type TabId = 'ots' | StationId | 'metrics';

interface Machine {
  name: string;
  tone: Tone;
  note?: string;
}

interface Content {
  toneLabel: Record<Tone, string>;
  tabs: { id: TabId; label: string }[];
  orders: OrderRow[];
  stations: Record<StationId, { icon: typeof IconCut; machines: Machine[] }>;
  oee: { label: string; value: number }[];
  activeOrders: string;
  stationHeading: (station: string) => string;
  stationField: string;
  metricsHeading: string;
}

const CONTENT: Record<LandingLanguage, Content> = {
  es: {
    toneLabel: { ok: 'En Regla', stopped: 'Detenida', warn: 'Mantención' },
    tabs: [
      { id: 'ots', label: 'OTs Activas' },
      { id: 'Corte', label: 'Corte' },
      { id: 'Armado', label: 'Armado' },
      { id: 'Pintura', label: 'Pintura' },
      { id: 'metrics', label: 'Métricas de Turno' },
    ],
    orders: [
      { id: 'OT-1042', name: 'Galpón Industrial Lote 4', station: 'Pintura', tone: 'ok' },
      { id: 'OT-1043', name: 'Vigas de Techumbre Nave 2', station: 'Armado', tone: 'stopped' },
      { id: 'OT-1044', name: 'Escalera Metálica Torre B', station: 'Calidad', tone: 'ok' },
      { id: 'OT-1045', name: 'Portón Corredizo Industrial', station: 'Corte', tone: 'ok' },
      { id: 'OT-1049', name: 'Silo Metálico 200 Ton', station: 'Calidad', tone: 'ok' },
    ],
    stations: {
      Corte: {
        icon: IconCut,
        machines: [
          { name: 'Sierra CNC-1', tone: 'ok' },
          { name: 'Plasma CNC-2', tone: 'ok' },
          { name: 'Cizalla Hidráulica', tone: 'warn', note: 'Mantención programada 15:00' },
        ],
      },
      Armado: {
        icon: IconTools,
        machines: [
          { name: 'Soldadora Robot A', tone: 'stopped', note: 'Cuello de botella — falta de personal calificado' },
          { name: 'Mesa de Ensamble 2', tone: 'ok' },
          { name: 'Puente Grúa 1', tone: 'ok' },
        ],
      },
      Pintura: {
        icon: IconSpray,
        machines: [
          { name: 'Cabina de Pintura 1', tone: 'ok' },
          { name: 'Cabina de Pintura 2', tone: 'ok' },
          { name: 'Horno de Curado', tone: 'ok' },
        ],
      },
    },
    oee: [
      { label: 'Disponibilidad', value: 92 },
      { label: 'Rendimiento', value: 88 },
      { label: 'Calidad', value: 96 },
      { label: 'OEE Global', value: 78 },
    ],
    activeOrders: 'Órdenes de Trabajo activas',
    stationHeading: (station) => `Estación ${station} — estado de máquinas`,
    stationField: 'Estación',
    metricsHeading: 'Métricas de Turno — OEE en vivo',
  },
  en: {
    toneLabel: { ok: 'On Track', stopped: 'Stopped', warn: 'Maintenance' },
    tabs: [
      { id: 'ots', label: 'Active Orders' },
      { id: 'Corte', label: 'Cutting' },
      { id: 'Armado', label: 'Assembly' },
      { id: 'Pintura', label: 'Painting' },
      { id: 'metrics', label: 'Shift Metrics' },
    ],
    orders: [
      { id: 'WO-1042', name: 'Industrial Warehouse Lot 4', station: 'Painting', tone: 'ok' },
      { id: 'WO-1043', name: 'Roof Beams — Bay 2', station: 'Assembly', tone: 'stopped' },
      { id: 'WO-1044', name: 'Steel Staircase Tower B', station: 'Quality', tone: 'ok' },
      { id: 'WO-1045', name: 'Industrial Sliding Gate', station: 'Cutting', tone: 'ok' },
      { id: 'WO-1049', name: '200-Ton Steel Silo', station: 'Quality', tone: 'ok' },
    ],
    stations: {
      Corte: {
        icon: IconCut,
        machines: [
          { name: 'CNC Saw 1', tone: 'ok' },
          { name: 'Plasma CNC 2', tone: 'ok' },
          { name: 'Hydraulic Shear', tone: 'warn', note: 'Scheduled maintenance at 3:00 PM' },
        ],
      },
      Armado: {
        icon: IconTools,
        machines: [
          { name: 'Robot Welder A', tone: 'stopped', note: 'Bottleneck — lacking qualified staff' },
          { name: 'Assembly Table 2', tone: 'ok' },
          { name: 'Bridge Crane 1', tone: 'ok' },
        ],
      },
      Pintura: {
        icon: IconSpray,
        machines: [
          { name: 'Paint Booth 1', tone: 'ok' },
          { name: 'Paint Booth 2', tone: 'ok' },
          { name: 'Curing Oven', tone: 'ok' },
        ],
      },
    },
    oee: [
      { label: 'Availability', value: 92 },
      { label: 'Performance', value: 88 },
      { label: 'Quality', value: 96 },
      { label: 'Overall OEE', value: 78 },
    ],
    activeOrders: 'Active work orders',
    stationHeading: (station) => `${station} station — machine status`,
    stationField: 'Station',
    metricsHeading: 'Shift Metrics — live OEE',
  },
};

/**
 * Mini-dashboard interactivo (no es una imagen ni un video) para la
 * sección "Torre de Control, en vivo" — pestañas reales con `useState`,
 * datos de ejemplo con la misma nomenclatura de OTs/estaciones que el
 * resto del sitio.
 */
export function TowerControlDemo() {
  const { language } = useLandingLanguage();
  const c = CONTENT[language];
  const [tab, setTab] = useState<TabId>('ots');

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/80 shadow-2xl shadow-black/50 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 border-b border-blue-900/30 px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-500/70" />
        <span className="size-2.5 rounded-full bg-amber-500/70" />
        <span className="size-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-xs text-slate-500">dmaix.app — {language === 'es' ? 'Torre de Control' : 'Control Tower'}</span>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-blue-900/30 px-3 py-2">
        {c.tabs.map((tItem) => (
          <button
            key={tItem.id}
            type="button"
            onClick={() => setTab(tItem.id)}
            aria-pressed={tab === tItem.id}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === tItem.id ? 'bg-blue-500/15 text-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      <div className="min-h-[19rem] p-5">
        <AnimatePresence mode="wait">
          {tab === 'ots' && (
            <motion.div key="ots" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <IconClipboardList className="size-4 text-blue-400" /> {c.activeOrders}
              </div>
              <div className="space-y-2">
                {c.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl border border-blue-900/30 bg-black/40 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-200">
                        {o.id} · {o.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{c.stationField}: {o.station}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${TONE_BADGE[o.tone]}`}>
                      {c.toneLabel[o.tone]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(tab === 'Corte' || tab === 'Armado' || tab === 'Pintura') &&
            (() => {
              const station = c.stations[tab];
              const Icon = station.icon;
              const stationLabel = c.tabs.find((tItem) => tItem.id === tab)?.label ?? tab;
              return (
                <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Icon className="size-4 text-blue-400" /> {c.stationHeading(stationLabel)}
                  </div>
                  <div className="space-y-2">
                    {station.machines.map((m) => (
                      <div key={m.name} className="rounded-xl border border-blue-900/30 bg-black/40 px-3.5 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                            <span className={`size-2 rounded-full ${TONE_DOT[m.tone]} ${m.tone !== 'stopped' ? 'animate-pulse' : ''}`} />
                            {m.name}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${TONE_BADGE[m.tone]}`}>{c.toneLabel[m.tone]}</span>
                        </div>
                        {m.note && (
                          <p className="mt-1.5 flex items-center gap-1.5 pl-4 text-[11px] text-amber-400/90">
                            <IconAlertTriangle className="size-3 shrink-0" /> {m.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

          {tab === 'metrics' && (
            <motion.div key="metrics" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <IconGauge className="size-4 text-blue-400" /> {c.metricsHeading}
              </div>
              <div className="space-y-4">
                {c.oee.map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{m.label}</span>
                      <span className="font-semibold text-emerald-400">{m.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
