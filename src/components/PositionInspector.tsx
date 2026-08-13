import React, { useState } from 'react';
import { Crosshair, MapPin, Zap, ArrowRight } from 'lucide-react';
import { PhysicsParams, StateAtTime } from '../types';
import {
  calculateFlightTime,
  calculateMaxHeightInfo,
  findTimeForTargetX,
  findTimeForTargetY,
} from '../utils/physics';
import { translations, Language } from '../utils/translations';

interface PositionInspectorProps {
  params: PhysicsParams;
  currentState: StateAtTime;
  onInspectTime: (t: number) => void;
  lang: Language;
}

export const PositionInspector: React.FC<PositionInspectorProps> = ({
  params,
  currentState,
  onInspectTime,
  lang,
}) => {
  const [targetXInput, setTargetXInput] = useState<string>('');
  const [targetYInput, setTargetYInput] = useState<string>('');
  const [targetTInput, setTargetTInput] = useState<string>('');
  const [preferDescending] = useState<boolean>(false);

  const t = translations[lang];

  const tImpact = calculateFlightTime(params);
  const { maxHeight, tMaxHeight } = calculateMaxHeightInfo(params);
  const rad = (params.angle * Math.PI) / 180;
  const range = params.v0 * Math.cos(rad) * tImpact;

  // Handle jump by X coordinate
  const handleJumpToX = () => {
    const xVal = parseFloat(targetXInput);
    if (isNaN(xVal)) return;
    const timeVal = findTimeForTargetX(params, xVal);
    onInspectTime(timeVal);
  };

  // Handle jump by Y height
  const handleJumpToY = () => {
    const yVal = parseFloat(targetYInput);
    if (isNaN(yVal)) return;
    const timeVal = findTimeForTargetY(params, yVal, preferDescending);
    onInspectTime(timeVal);
  };

  // Handle jump by Time t
  const handleJumpToT = () => {
    const tVal = parseFloat(targetTInput);
    if (isNaN(tVal)) return;
    const boundedT = Math.max(0, Math.min(tImpact, tVal));
    onInspectTime(boundedT);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Crosshair className="w-4.5 h-4.5 text-emerald-600" />
          {t.inspectorTitle}
        </h3>
        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
          {lang === 'bn' ? 'স্থির রেখে পর্যবেক্ষণ' : 'Freeze & Inspect'}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        {t.inspectorSubtitle}
      </p>

      {/* Coordinate & Time Direct Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Input X */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-sky-700">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              {t.rangeX}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max: {range.toFixed(1)}m</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              placeholder={`e.g. ${(range * 0.5).toFixed(1)}`}
              value={targetXInput}
              onChange={(e) => setTargetXInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToX()}
              className="w-full bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-sky-600"
            />
            <button
              onClick={handleJumpToX}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-all shrink-0 active:scale-95 flex items-center gap-1"
            >
              {t.go}
            </button>
          </div>
        </div>

        {/* Input Y (Height) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-amber-700">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              {t.heightY}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max: {maxHeight.toFixed(1)}m</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              placeholder={`e.g. ${(maxHeight * 0.5).toFixed(1)}`}
              value={targetYInput}
              onChange={(e) => setTargetYInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToY()}
              className="w-full bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-amber-600"
            />
            <button
              onClick={handleJumpToY}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all shrink-0 active:scale-95 flex items-center gap-1"
            >
              {t.go}
            </button>
          </div>
        </div>

        {/* Input Time (t) */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              {t.timeSec}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Max: {tImpact.toFixed(2)}s</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder={`e.g. ${(tImpact * 0.5).toFixed(2)}`}
              value={targetTInput}
              onChange={(e) => setTargetTInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpToT()}
              className="w-full bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-emerald-600"
            />
            <button
              onClick={handleJumpToT}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shrink-0 active:scale-95 flex items-center gap-1"
            >
              {t.go}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Milestone Jump Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
          {lang === 'bn' ? 'দ্রুত মূল বিন্দুসমূহ:' : 'Quick Landmark Snapshots:'}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onInspectTime(0)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-all"
          >
            🚀 {lang === 'bn' ? 'নিক্ষেপ (t=0s)' : 'Launch (t=0s)'}
          </button>
          {tMaxHeight > 0 && (
            <button
              onClick={() => onInspectTime(tMaxHeight)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium border border-amber-200 transition-all"
            >
              ⭐ {lang === 'bn' ? 'সর্বোচ্চ উচ্চতা' : 'Apex Peak'} ({maxHeight.toFixed(1)}m)
            </button>
          )}
          <button
            onClick={() => onInspectTime(tImpact * 0.5)}
            className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium border border-sky-200 transition-all"
          >
            🎯 {lang === 'bn' ? 'মধ্যবর্তী গতিপথ (50% t)' : 'Mid-Flight (50% t)'}
          </button>
          <button
            onClick={() => onInspectTime(tImpact)}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium border border-rose-200 transition-all"
          >
            💥 {lang === 'bn' ? 'ভূমি স্পর্শ' : 'Impact'} ({range.toFixed(1)}m)
          </button>
        </div>
      </div>

      {/* Inspected Point Active Telemetry Card */}
      <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 shadow-md border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono text-emerald-400">
              {lang === 'bn' ? 'বর্তমান পর্যবেক্ষাধীন বিন্দু' : 'Active Inspected Position'}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-300">
            {t.timeSecShort} t = <strong className="text-emerald-300">{currentState.t.toFixed(2)}s</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">{t.rangeX}</span>
            <span className="text-sky-300 font-bold text-sm">{currentState.x.toFixed(2)} m</span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">{t.heightY}</span>
            <span className="text-amber-300 font-bold text-sm">{currentState.y.toFixed(2)} m</span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">{t.totalVelV}</span>
            <span className="text-emerald-300 font-bold text-sm">{currentState.v.toFixed(1)} m/s</span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block uppercase">Vx / Vy</span>
            <span className="text-slate-200 font-bold text-xs">
              {currentState.vx.toFixed(1)} / {currentState.vy.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Inspected Energy Ratio Pill Bars */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-sky-300 font-bold">
              Ek: {currentState.ek.toFixed(1)} J ({currentState.ekPercent.toFixed(1)}%)
            </span>
            <span className="text-amber-300 font-bold">
              Ep: {currentState.ep.toFixed(1)} J ({currentState.epPercent.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex border border-slate-700">
            <div
              className="bg-sky-500 h-full transition-all duration-200"
              style={{ width: `${currentState.ekPercent}%` }}
              title={`Kinetic Energy: ${currentState.ek.toFixed(1)} J`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-200"
              style={{ width: `${currentState.epPercent}%` }}
              title={`Potential Energy: ${currentState.ep.toFixed(1)} J`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Ek = ½m·v²</span>
            <span className="text-emerald-400 font-bold">E_total = {currentState.eTotal.toFixed(1)} J</span>
            <span>Ep = m·g·y</span>
          </div>
        </div>
      </div>
    </div>
  );
};

