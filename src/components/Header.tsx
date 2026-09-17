import React from 'react';
import { RotateCcw, Zap, Globe } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface HeaderProps {
  speedMultiplier: number;
  onChangeSpeed: (speed: number) => void;
  onOpenHelp?: () => void;
  onResetAll: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  speedMultiplier,
  onChangeSpeed,
  onResetAll,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white/95 border-b border-slate-200 text-slate-800 px-3 sm:px-5 lg:px-7 py-2 shadow-xs sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
        {/* Title & Brand (Left) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Zap className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 leading-tight whitespace-nowrap">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                {t.physicsLab}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden xl:block leading-tight truncate">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Quick Controls & Branding (Right) - Single Horizontal Line */}
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
          {/* Playback Speed Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            <span className="text-[11px] font-bold text-slate-600 px-1.5 hidden md:flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              {t.speedLabel}
            </span>
            {[0.25, 0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  speedMultiplier === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Compact Small Language Switcher Button */}
          <button
            onClick={onToggleLang}
            title={t.langToggleTitle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-2xs active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
          </button>

          {/* Global Reset Button */}
          <button
            onClick={onResetAll}
            title={t.resetBtnTitle}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all shadow-2xs shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Two-Line UDVASH Academic Branding on Far Right (No Bangla) */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-3.5 sm:px-4 py-1 rounded-xl shadow-md border border-red-500/40 select-none shrink-0 whitespace-nowrap text-center">
            <span className="font-black text-xs sm:text-sm tracking-wider uppercase font-sans leading-tight">
              UDVASH
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] text-rose-100 font-bold tracking-widest uppercase font-mono leading-none">
              Academic
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

