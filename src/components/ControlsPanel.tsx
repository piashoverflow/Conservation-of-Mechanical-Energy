import React from 'react';
import {
  Eye,
  Sliders,
  Compass,
  ArrowUpRight,
  Scale,
  Gauge,
} from 'lucide-react';
import { PhysicsParams, ViewOptions } from '../types';
import { translations, Language } from '../utils/translations';

interface ControlsPanelProps {
  params: PhysicsParams;
  onChangeParams: (newParams: Partial<PhysicsParams>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onStep: (delta: number) => void;
  currentTime: number;
  maxTime: number;
  onScrubTime: (t: number) => void;
  speedMultiplier: number;
  onChangeSpeed: (speed: number) => void;
  viewOptions: ViewOptions;
  onToggleViewOption: (key: keyof ViewOptions) => void;
  lang: Language;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  params,
  onChangeParams,
  currentTime,
  maxTime,
  viewOptions,
  onToggleViewOption,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-emerald-600" />
          {t.simControls}
        </h2>
        <span className="text-xs text-slate-500 font-mono font-medium bg-slate-100 px-2.5 py-1 rounded-md">
          t = {currentTime.toFixed(2)}s / {maxTime.toFixed(2)}s
        </span>
      </div>

      {/* Primary Parameters Inputs */}
      <div className="space-y-3.5">
        {/* Initial Height (h0) */}
        <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-800 font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              {t.height}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={params.h0}
                onChange={(e) =>
                  onChangeParams({ h0: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })
                }
                className="w-16 bg-white text-sky-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-300 text-right focus:outline-none focus:border-sky-600 font-semibold"
              />
              <span className="text-slate-500 text-[11px] font-medium">m</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={params.h0}
            onChange={(e) => onChangeParams({ h0: parseFloat(e.target.value) })}
            className="w-full accent-sky-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Initial Velocity (v0) */}
        <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-800 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              {t.initialVelocity}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={params.v0}
                onChange={(e) =>
                  onChangeParams({ v0: Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)) })
                }
                className="w-16 bg-white text-emerald-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-300 text-right focus:outline-none focus:border-emerald-600 font-semibold"
              />
              <span className="text-slate-500 text-[11px] font-medium">m/s</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={0.5}
            value={params.v0}
            onChange={(e) => onChangeParams({ v0: parseFloat(e.target.value) })}
            className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Launch Angle (θ) */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-900 font-bold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              {t.launchAngle}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={-90}
                max={90}
                step={1}
                value={params.angle}
                onChange={(e) => {
                  const newAngle = Math.max(-90, Math.min(90, parseInt(e.target.value, 10) || 0));
                  if (params.v0 === 0 && Math.abs(newAngle) !== 90) {
                    onChangeParams({ angle: newAngle, v0: 15 });
                  } else {
                    onChangeParams({ angle: newAngle });
                  }
                }}
                className="w-16 bg-white text-amber-800 font-mono text-xs px-2 py-0.5 rounded border border-slate-300 text-right focus:outline-none focus:border-amber-600 font-bold shadow-2xs"
              />
              <span className="text-slate-700 text-[11px] font-bold">°</span>
            </div>
          </div>
          <input
            type="range"
            min={-90}
            max={90}
            step={1}
            value={params.angle}
            onChange={(e) => {
              const newAngle = parseInt(e.target.value, 10);
              if (params.v0 === 0 && Math.abs(newAngle) !== 90) {
                onChangeParams({ angle: newAngle, v0: 15 });
              } else {
                onChangeParams({ angle: newAngle });
              }
            }}
            className="w-full accent-amber-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-700 font-mono font-bold">
            <span>-90° ({lang === 'bn' ? 'নিচে' : 'Down'})</span>
            <span>0° ({lang === 'bn' ? 'সমতল' : 'Flat'})</span>
            <span>90° ({lang === 'bn' ? 'উপরে' : 'Up'})</span>
          </div>
        </div>

        {/* Mass (m) */}
        <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <label className="text-slate-800 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-600" />
              {t.mass}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={params.mass}
                onChange={(e) =>
                  onChangeParams({ mass: Math.max(0.1, Math.min(10, parseFloat(e.target.value) || 0.1)) })
                }
                className="w-16 bg-white text-purple-700 font-mono text-xs px-2 py-0.5 rounded border border-slate-300 text-right focus:outline-none focus:border-purple-600 font-semibold"
              />
              <span className="text-slate-500 text-[11px] font-medium">kg</span>
            </div>
          </div>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={params.mass}
            onChange={(e) => onChangeParams({ mass: parseFloat(e.target.value) })}
            className="w-full accent-purple-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Canvas View Toggles */}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
          <Eye className="w-3.5 h-3.5 text-sky-600" />
          {t.displayOptions}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggleViewOption('showTrajectory')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              viewOptions.showTrajectory
                ? 'bg-sky-50 text-sky-800 border-sky-300 font-semibold'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${viewOptions.showTrajectory ? 'bg-sky-500' : 'bg-slate-300'}`} />
            {t.trajectory}
          </button>

          <button
            onClick={() => onToggleViewOption('showVectors')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              viewOptions.showVectors
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${viewOptions.showVectors ? 'bg-amber-500' : 'bg-slate-300'}`} />
            {t.velocityVectors}
          </button>

          <button
            onClick={() => onToggleViewOption('showGrid')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              viewOptions.showGrid
                ? 'bg-purple-50 text-purple-800 border-purple-300 font-semibold'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${viewOptions.showGrid ? 'bg-purple-500' : 'bg-slate-300'}`} />
            {t.gridAxes}
          </button>

          <button
            onClick={() => onToggleViewOption('showTrail')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
              viewOptions.showTrail
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${viewOptions.showTrail ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {t.particleTrail}
          </button>
        </div>
      </div>
    </div>
  );
};

