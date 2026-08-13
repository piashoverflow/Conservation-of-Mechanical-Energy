import React from 'react';
import { Bookmark, MousePointer, ShieldCheck } from 'lucide-react';
import { PhysicsParams } from '../types';
import { calculateSimulationSummary } from '../utils/physics';
import { translations, Language } from '../utils/translations';

interface KeyPointsTableProps {
  params: PhysicsParams;
  onJumpToTime: (t: number) => void;
  currentTime: number;
  lang: Language;
}

export const KeyPointsTable: React.FC<KeyPointsTableProps> = ({
  params,
  onJumpToTime,
  currentTime,
  lang,
}) => {
  const t = translations[lang];

  const summary = calculateSimulationSummary(params);
  const { launch, maxHeight, impact } = summary.keyPoints;

  // Translate milestone labels if in Bangla
  const launchTranslated = { ...launch, label: lang === 'bn' ? t.launchPoint : launch.label };
  const maxHeightTranslated = { ...maxHeight, label: lang === 'bn' ? t.apexPoint : maxHeight.label };
  const impactTranslated = { ...impact, label: lang === 'bn' ? t.impactPoint : impact.label };

  const points = [launchTranslated, maxHeightTranslated, impactTranslated];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4.5 h-4.5 text-emerald-600" />
            {t.keyPointsTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.keyPointsSubtitle}
          </p>
        </div>
        <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono font-medium">
          {t.clickToJump}
        </span>
      </div>

      {/* Snapshot Cards / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider bg-slate-50">
              <th className="py-2.5 px-3">{t.point}</th>
              <th className="py-2.5 px-3">{t.timeCol}</th>
              <th className="py-2.5 px-3">{t.heightCol}</th>
              <th className="py-2.5 px-3">{t.velocityCol}</th>
              <th className="py-2.5 px-3 text-sky-700">{t.ekCol}</th>
              <th className="py-2.5 px-3 text-amber-700">{t.epCol}</th>
              <th className="py-2.5 px-3 text-emerald-700">{t.etotalCol}</th>
              <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {points.map((pt, index) => {
              const isSelected = Math.abs(currentTime - pt.t) < 0.05;
              return (
                <tr
                  key={index}
                  onClick={() => onJumpToTime(pt.t)}
                  className={`cursor-pointer transition-all hover:bg-slate-50 ${
                    isSelected ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                  }`}
                >
                  {/* Label */}
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-sky-500' : index === 1 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                    />
                    {pt.label}
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 text-slate-700 font-medium">{pt.t.toFixed(2)}s</td>

                  {/* Height */}
                  <td className="py-3 px-3 text-slate-700 font-medium">{pt.y.toFixed(1)}m</td>

                  {/* Speed */}
                  <td className="py-3 px-3 text-slate-700 font-medium">{pt.v.toFixed(1)} m/s</td>

                  {/* Ek */}
                  <td className="py-3 px-3 text-sky-700 font-bold">{pt.ek.toFixed(1)} J</td>

                  {/* Ep */}
                  <td className="py-3 px-3 text-amber-700 font-bold">{pt.ep.toFixed(1)} J</td>

                  {/* Etotal */}
                  <td className="py-3 px-3 text-emerald-800 font-extrabold bg-emerald-50 rounded">
                    {pt.eTotal.toFixed(1)} J
                  </td>

                  {/* Jump Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onJumpToTime(pt.t);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-[11px] transition-all font-sans font-medium border border-slate-200"
                    >
                      <MousePointer className="w-3 h-3" />
                      {lang === 'bn' ? 'যাও' : 'Jump'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Physics Takeaway Callout */}
      <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-xs text-slate-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-900">
            {lang === 'bn' ? 'সংরক্ষণশীলতা সূত্রের সত্যতা:' : 'Law Verification:'}{' '}
          </span>
          {lang === 'bn' ? (
            <>
              উপরের ৩টি মূল বিন্দুর <span className="text-emerald-800 font-bold">মোট শক্তি (Total E)</span> কলামটি লক্ষ করুন।
              <span className="text-emerald-900 font-mono font-bold"> {launch.eTotal.toFixed(1)} জুল </span>
              শক্তি নিক্ষেপ → সর্বোচ্চ উচ্চতা → ভূমি স্পর্শ মুহূর্ত পর্যন্ত ১০০% অপরিবর্তিত রয়েছে! শক্তি ধ্বংস বা সৃষ্টি হয়নি, কেবল বিভবশক্তি (mgy) ও গতিশক্তিতে (½mv²) রূপান্তর ঘটেছে।
            </>
          ) : (
            <>
              Compare the <span className="text-emerald-800 font-bold">Total E</span> column across all 3 key points above. Notice how
              <span className="text-emerald-900 font-mono font-bold"> {launch.eTotal.toFixed(1)} Joules </span>
              remains 100% constant from Launch → Apex → Impact! Energy is neither created nor destroyed; it only converts between Potential (mgy) and Kinetic (½mv²).
            </>
          )}
        </div>
      </div>
    </div>
  );
};

