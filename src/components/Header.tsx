import React from 'react';
import { BookOpen, RotateCcw, Zap, Globe } from 'lucide-react';
import { PresetScenario } from '../types';
import { translations, Language } from '../utils/translations';

interface HeaderProps {
  activePreset: PresetScenario;
  onSelectPreset: (preset: PresetScenario) => void;
  speedMultiplier: number;
  onChangeSpeed: (speed: number) => void;
  onOpenHelp: () => void;
  onResetAll: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePreset,
  onSelectPreset,
  speedMultiplier,
  onChangeSpeed,
  onOpenHelp,
  onResetAll,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white/95 border-b border-slate-200 text-slate-800 px-4 lg:px-8 py-3 shadow-sm sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-[1920px] w-full mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              {t.appTitle}
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t.physicsLab}
              </span>
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Preset Buttons & Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Language Toggle Button - Prominent Option Top Right */}
          <button
            onClick={onToggleLang}
            title={t.langToggleTitle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 border border-sky-500/50"
          >
            <Globe className="w-4 h-4 text-sky-100" />
            <span>{lang === 'bn' ? 'English Version' : 'বাংলা ভার্সন'}</span>
          </button>

          {/* Scenario Presets */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => onSelectPreset('free_fall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'free_fall'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t.presetFreeFall}
            </button>
            <button
              onClick={() => onSelectPreset('upward_throw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'upward_throw'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t.presetUpwardThrow}
            </button>
            <button
              onClick={() => onSelectPreset('projectile_motion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreset === 'projectile_motion'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {t.presetProjectile}
            </button>
          </div>

          {/* Playback Speed Selector (0.25x, 0.5x, 1x, 2x) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              {t.speedLabel}
            </span>
            {[0.25, 0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  speedMultiplier === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Theory / Guide Button */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 text-xs font-bold transition-all shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.theoryBtn}</span>
          </button>

          {/* Global Reset */}
          <button
            onClick={onResetAll}
            title={t.resetBtnTitle}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* UDVASH Branding Badge on Extreme Right */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white px-3.5 py-1.5 rounded-xl shadow-md border border-red-500/40 select-none ml-1">
            <div className="flex flex-col text-right leading-none">
              <span className="font-extrabold text-sm tracking-wide font-sans">উদ্ভাস</span>
              <span className="text-[8px] text-rose-100 font-bold tracking-widest uppercase">UDVASH</span>
            </div>
            <div className="h-5 w-px bg-white/30" />
            <span className="text-[10px] font-bold bg-white text-rose-700 px-1.5 py-0.5 rounded shadow-2xs uppercase font-mono tracking-tight">
              {t.udvashSub}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

