import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { PhysicsParams } from '../types';
import { generateTrajectoryPoints } from '../utils/physics';
import { translations, Language } from '../utils/translations';

interface EnergyGraphProps {
  params: PhysicsParams;
  currentTime: number;
  lang?: Language;
}

export const EnergyGraph: React.FC<EnergyGraphProps> = ({ params, currentTime, lang = 'en' }) => {
  const t = translations[lang];

  // Generate 80 sampled data points across the trajectory time
  const data = useMemo(() => {
    const points = generateTrajectoryPoints(params, 80);
    return points.map((p) => ({
      t: parseFloat(p.t.toFixed(2)),
      Ek: parseFloat(p.ek.toFixed(1)),
      Ep: parseFloat(p.ep.toFixed(1)),
      Etotal: parseFloat(p.eTotal.toFixed(1)),
    }));
  }, [params]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
          {t.graphTitle}
        </h2>
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <span className="flex items-center gap-1 text-sky-700 font-semibold">
            <span className="w-2.5 h-1 bg-sky-600 rounded inline-block" /> Ek
          </span>
          <span className="flex items-center gap-1 text-amber-700 font-semibold">
            <span className="w-2.5 h-1 bg-amber-500 rounded inline-block" /> Ep
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2.5 h-1 bg-emerald-600 rounded inline-block" /> {lang === 'bn' ? 'মোট' : 'Total'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="t"
              stroke="#475569"
              fontSize={11}
              fontWeight="bold"
              tickFormatter={(v) => `${v}s`}
              label={{ value: lang === 'bn' ? 'সময় (s)' : 'Time (s)', position: 'insideBottom', offset: -2, fill: '#1e293b', fontSize: 11, fontWeight: 'bold' }}
            />
            <YAxis
              stroke="#475569"
              fontSize={11}
              fontWeight="bold"
              tickFormatter={(v) => `${v}J`}
              width={42}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#0f172a',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
              formatter={(value: any, name: any) => [`${value} Joules`, name]}
              labelFormatter={(label) => `${lang === 'bn' ? 'সময়' : 'Time'}: ${label}s`}
            />

            {/* Current Time Cursor Line */}
            <ReferenceLine
              x={parseFloat(currentTime.toFixed(2))}
              stroke="#059669"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{ value: lang === 'bn' ? 'এখন' : 'Now', position: 'top', fill: '#059669', fontSize: 10, fontWeight: 'bold' }}
            />

            <Line
              type="monotone"
              dataKey="Ek"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={false}
              name={t.kineticEnergy}
            />
            <Line
              type="monotone"
              dataKey="Ep"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              name={t.potentialEnergy}
            />
            <Line
              type="monotone"
              dataKey="Etotal"
              stroke="#059669"
              strokeWidth={3}
              dot={false}
              name={t.totalEnergy}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

