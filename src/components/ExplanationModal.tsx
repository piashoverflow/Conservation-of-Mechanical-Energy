import React from 'react';
import { X, BookOpen, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.theoryTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.theorySubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section 1: The Core Law */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {t.lawStatementTitle}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {t.lawStatementText}
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center font-mono text-xs text-emerald-900 font-bold">
            E_total = Ek + Ep = ½m·v² + m·g·y = CONSTANT
          </div>
        </div>

        {/* Content Section 2: Formulas Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-700 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t.formulasTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-sky-700 block">{t.kineticEnergy}</span>
              <p className="text-slate-600">{t.keFormulaDesc}</p>
              <div className="font-mono text-sky-800 font-bold text-xs pt-1">
                Ek = ½ · m · v²
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-amber-700 block">{t.potentialEnergy}</span>
              <p className="text-slate-600">{t.peFormulaDesc}</p>
              <div className="font-mono text-amber-800 font-bold text-xs pt-1">
                Ep = m · g · y
              </div>
            </div>
          </div>
        </div>

        {/* Content Section 3: The 3 Scenarios Explained */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            {t.scenariosTitle}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {t.freeFallDesc}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {t.upwardThrowDesc}
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {t.projectileDesc}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            {t.closeModalBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

