import React from 'react';
import { Activity, ShieldCheck, Zap, Scale, Info, CheckCircle2 } from 'lucide-react';
import { StateAtTime } from '../types';
import { translations, Language } from '../utils/translations';

interface EnergyBreakdownProps {
  state: StateAtTime;
  mass: number;
  g: number;
  lang?: Language;
}

export const EnergyBreakdown: React.FC<EnergyBreakdownProps> = ({ state, mass, g, lang = 'en' }) => {
  const { ek, ep, eTotal, ekPercent, epPercent, v, y } = state;
  const t = translations[lang];

  // Calculate energy ratios safely
  const ekToEpRatio = ep > 0.001 ? (ek / ep).toFixed(2) : '∞';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-emerald-600" />
          {t.energyBreakdownTitle}
        </h2>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" /> E_total = Constant
        </span>
      </div>

      {/* 1. Dynamic Energy Progress Bars */}
      <div className="space-y-3.5">
        {/* Kinetic Energy (Ek) */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-sky-700 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              {t.kineticEnergy} (Ek = ½mv²)
            </span>
            <div className="font-mono text-xs">
              <span className="text-sky-800 font-bold">{ek.toFixed(2)} J</span>
              <span className="text-slate-500 ml-2">({ekPercent.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-75 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, ekPercent))}%` }}
            />
          </div>
        </div>

        {/* Potential Energy (Ep) */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-amber-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              {t.potentialEnergy} (Ep = mgy)
            </span>
            <div className="font-mono text-xs">
              <span className="text-amber-800 font-bold">{ep.toFixed(2)} J</span>
              <span className="text-slate-500 ml-2">({epPercent.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-75 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, epPercent))}%` }}
            />
          </div>
        </div>

        {/* Total Mechanical Energy (Etotal) */}
        <div className="space-y-1.5 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t.totalEnergy} (E_total)
            </span>
            <span className="font-mono text-sm font-extrabold text-emerald-900">
              {eTotal.toFixed(2)} J
            </span>
          </div>
          {/* Stacked bar showing Ek and Ep combining to equal 100% of Etotal */}
          <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden flex border border-emerald-300/80 p-0.5">
            <div
              className="bg-sky-500 h-full transition-all duration-75"
              style={{ width: `${ekPercent}%` }}
              title={`Ek: ${ek.toFixed(1)} J`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-75"
              style={{ width: `${epPercent}%` }}
              title={`Ep: ${ep.toFixed(1)} J`}
            />
          </div>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <span>
              {lang === 'bn'
                ? 'বিভবশক্তি (Ep) যতটুকু কমে, গতিশক্তি (Ek) ঠিক ততটুকুই বৃদ্ধি পায়!'
                : 'As Ep decreases, Ek increases by the exact same amount!'}
            </span>
          </p>
        </div>
      </div>

      {/* 2. Live Equations & Ratio Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Live Ratio Card */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-600" />
            {lang === 'bn' ? 'শক্তির অনুপাত' : 'Energy Ratios'}
          </div>
          <div className="space-y-1 font-mono text-xs text-slate-700">
            <div>
              • Ek = <span className="text-sky-700 font-bold">{ekPercent.toFixed(1)}%</span>
            </div>
            <div>
              • Ep = <span className="text-amber-700 font-bold">{epPercent.toFixed(1)}%</span>
            </div>
            <div className="pt-1 border-t border-slate-200 text-emerald-700 font-semibold">
              {ep > 0.1 ? (
                <span>Ek = {ekToEpRatio} × Ep</span>
              ) : (
                <span>{lang === 'bn' ? 'Ep = 0 J (ভূমিতে কেবল গতিশক্তি)' : 'Ep = 0 J (Pure Ek at ground)'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Live Formula Inputs Card */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            {lang === 'bn' ? 'লাইভ গাণিতিক ইনপুট' : 'Live Mathematical Inputs'}
          </div>
          <div className="space-y-1 font-mono text-[11px] text-slate-600">
            <div>
              Ek = 0.5×{mass}×({v.toFixed(1)})² = <span className="text-sky-700 font-semibold">{ek.toFixed(1)}J</span>
            </div>
            <div>
              Ep = {mass}×{g}×{y.toFixed(1)} = <span className="text-amber-700 font-semibold">{ep.toFixed(1)}J</span>
            </div>
            <div className="pt-1 border-t border-slate-200 text-emerald-700 font-bold">
              E = {ek.toFixed(1)} + {ep.toFixed(1)} = {eTotal.toFixed(1)}J
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

