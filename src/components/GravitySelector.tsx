import React from 'react';
import { Globe, ArrowDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface GravitySelectorProps {
  gValue: number;
  onChangeG: (g: number) => void;
  lang: Language;
}

export const GravitySelector: React.FC<GravitySelectorProps> = ({
  gValue,
  onChangeG,
  lang,
}) => {
  const t = translations[lang];

  const presets = [
    { label: lang === 'bn' ? '🌍 পৃথিবী (9.8)' : '🌍 Earth (9.8)', value: 9.8, title: 'Earth (Default 9.8 m/s²)', color: 'bg-sky-600' },
    { label: lang === 'bn' ? '🌕 চাঁদ' : '🌕 Moon', value: 1.62, title: 'Moon (1.62 m/s²)', color: 'bg-purple-600' },
    { label: lang === 'bn' ? '🔴 মঙ্গল' : '🔴 Mars', value: 3.71, title: 'Mars (3.71 m/s²)', color: 'bg-rose-600' },
    { label: lang === 'bn' ? '🪐 বৃহস্পতি' : '🪐 Jupiter', value: 24.79, title: 'Jupiter (24.79 m/s²)', color: 'bg-amber-600' },
    { label: lang === 'bn' ? '⚡ ১০ m/s²' : '⚡ 10 m/s²', value: 10.0, title: 'Standard Approx (10 m/s²)', color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Title & Numeric Input */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              {t.gravityTitle}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {t.gravitySubtitleDefault} <strong className="text-sky-700">{t.gravityEarthLabel}</strong>
            </p>
          </div>
        </div>

        {/* Numeric Input */}
        <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200 shrink-0">
          <ArrowDown className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" />
          <span className="text-xs font-bold text-slate-700">g =</span>
          <input
            type="number"
            step="0.01"
            min={0.1}
            max={50}
            value={gValue}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 0) {
                onChangeG(Math.min(50, val));
              }
            }}
            className="w-16 bg-white text-sky-700 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-slate-300 text-right focus:outline-none focus:border-sky-600"
          />
          <span className="text-[11px] font-bold text-slate-600">m/s²</span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
          {lang === 'bn' ? 'প্রিসেটসমূহ:' : 'Presets:'}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 w-full">
          {presets.map((preset) => {
            const isSelected = Math.abs(gValue - preset.value) < 0.05;
            return (
              <button
                key={preset.label}
                onClick={() => onChangeG(preset.value)}
                title={preset.title}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                  isSelected
                    ? `${preset.color} text-white shadow-xs`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dedicated Full-Width Slider */}
      <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/90">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
          <span>{t.sliderAdjustment}</span>
          <span className="text-sky-700 font-bold font-mono">{gValue.toFixed(2)} m/s²</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">1.0</span>
          <input
            type="range"
            min={1.0}
            max={30.0}
            step={0.1}
            value={gValue}
            onChange={(e) => onChangeG(parseFloat(e.target.value))}
            className="w-full accent-sky-600 bg-slate-200 h-2 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">30.0</span>
        </div>
      </div>
    </div>
  );
};

