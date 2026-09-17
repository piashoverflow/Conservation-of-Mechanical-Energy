import React from 'react';
import { Layers, ArrowDownCircle, ArrowUpCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { PresetScenario } from '../types';
import { translations, Language } from '../utils/translations';

interface ScenarioModulesProps {
  activePreset: PresetScenario;
  onSelectPreset: (preset: PresetScenario) => void;
  lang: Language;
}

export const ScenarioModules: React.FC<ScenarioModulesProps> = ({
  activePreset,
  onSelectPreset,
  lang,
}) => {
  const t = translations[lang];

  const modules = [
    {
      id: 'free_fall' as PresetScenario,
      title: t.presetFreeFall,
      subtitle: t.moduleFreeFallSub,
      icon: ArrowDownCircle,
      accentColor: 'text-sky-600',
      activeBg: 'bg-sky-50 border-sky-400 text-sky-950',
    },
    {
      id: 'upward_throw' as PresetScenario,
      title: t.presetUpwardThrow,
      subtitle: t.moduleUpwardThrowSub,
      icon: ArrowUpCircle,
      accentColor: 'text-amber-600',
      activeBg: 'bg-amber-50 border-amber-400 text-amber-950',
    },
    {
      id: 'projectile_motion' as PresetScenario,
      title: t.presetProjectile,
      subtitle: t.moduleProjectileSub,
      icon: TrendingUp,
      accentColor: 'text-emerald-600',
      activeBg: 'bg-emerald-50 border-emerald-400 text-emerald-950',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {t.modulesTitle}
            </h2>
            <p className="text-[11px] text-slate-500">
              {t.modulesSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Module Buttons */}
      <div className="grid grid-cols-1 gap-2">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activePreset === m.id;

          return (
            <button
              key={m.id}
              onClick={() => onSelectPreset(m.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group active:scale-[0.99] ${
                isActive
                  ? `${m.activeBg} border-2 shadow-xs`
                  : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                    isActive ? 'bg-white shadow-xs' : 'bg-white/80 border border-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? m.accentColor : 'text-slate-600'}`} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold truncate flex items-center gap-1.5">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono truncate">
                    {m.subtitle}
                  </div>
                </div>
              </div>

              {isActive ? (
                <span className="shrink-0 ml-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  {lang === 'bn' ? 'বাছাই' : 'Select'} →
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
