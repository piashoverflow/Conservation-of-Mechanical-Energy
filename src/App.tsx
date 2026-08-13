import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ControlsPanel } from './components/ControlsPanel';
import { SimulationCanvas } from './components/SimulationCanvas';
import { EnergyBreakdown } from './components/EnergyBreakdown';
import { EnergyGraph } from './components/EnergyGraph';
import { KeyPointsTable } from './components/KeyPointsTable';
import { ExplanationModal } from './components/ExplanationModal';
import { PositionInspector } from './components/PositionInspector';
import { GravitySelector } from './components/GravitySelector';
import { PhysicsParams, PresetScenario, ViewOptions } from './types';
import {
  calculateFlightTime,
  calculateStateAtTime,
  SCENARIO_PRESETS,
} from './utils/physics';
import { Language } from './utils/translations';

export default function App() {
  // --- Language State ---
  const [lang, setLang] = useState<Language>('bn'); // Default to Bangla as requested

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  // --- Parameters State ---
  const [params, setParams] = useState<PhysicsParams>({
    h0: 20,
    v0: 15,
    angle: 45,
    mass: 1,
    g: 9.8,
  });

  const [activePreset, setActivePreset] = useState<PresetScenario>('custom');

  // --- Animation & Simulation Controls State ---
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);

  // --- Display Toggles ---
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showTrajectory: true,
    showVectors: false, // Vectors disabled by default as requested; enabled on demand
    showGrid: true,
    showTrail: true,
    autoScale: true,
    soundEnabled: false,
  });

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Derive total flight duration
  const maxTime = calculateFlightTime(params);
  const currentState = calculateStateAtTime(params, currentTime);

  // Animation Frame Loop
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const updateSimulation = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const elapsed = (timestamp - lastTimeRef.current) / 1000; // in seconds
        setCurrentTime((prev) => {
          const next = prev + elapsed * speedMultiplier;
          if (next >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
          return next;
        });
      }
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(updateSimulation);
      }
    },
    [isPlaying, maxTime, speedMultiplier]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(updateSimulation);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, updateSimulation]);

  // Handle parameter edits
  const handleParamsChange = (newParams: Partial<PhysicsParams>) => {
    setParams((prev) => {
      const updated = { ...prev, ...newParams };
      return updated;
    });
    setActivePreset('custom');
    // Clamp current time if max time changed
    const newMaxTime = calculateFlightTime({ ...params, ...newParams });
    setCurrentTime((t) => Math.min(t, newMaxTime));
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: PresetScenario) => {
    if (SCENARIO_PRESETS[preset]) {
      setParams(SCENARIO_PRESETS[preset].params);
      setActivePreset(preset);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // Handle Gravity Toggle
  const handleToggleG = (newG: number) => {
    setParams((prev) => ({ ...prev, g: newG }));
  };

  // Reset to time t = 0
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Reset all parameters to defaults
  const handleResetAll = () => {
    setIsPlaying(false);
    setParams({
      h0: 20,
      v0: 15,
      angle: 45,
      mass: 1,
      g: 9.8,
    });
    setActivePreset('custom');
    setCurrentTime(0);
  };

  // Step forward or backward
  const handleStep = (deltaSeconds: number) => {
    setIsPlaying(false);
    setCurrentTime((t) => Math.max(0, Math.min(maxTime, t + deltaSeconds)));
  };

  // View option toggle
  const handleToggleViewOption = (key: keyof ViewOptions) => {
    setViewOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <Header
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        speedMultiplier={speedMultiplier}
        onChangeSpeed={(s) => setSpeedMultiplier(s)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onResetAll={handleResetAll}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-6">
        {/* Main 3-Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column Sidebar: Controls Panel (3 Cols on XL, 4 Cols on LG) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <ControlsPanel
              params={params}
              onChangeParams={handleParamsChange}
              isPlaying={isPlaying}
              onTogglePlay={() => {
                if (currentTime >= maxTime) {
                  setCurrentTime(0);
                }
                setIsPlaying(!isPlaying);
              }}
              onReset={handleReset}
              onStep={handleStep}
              currentTime={currentTime}
              maxTime={maxTime}
              onScrubTime={(t) => {
                setIsPlaying(false);
                setCurrentTime(t);
              }}
              speedMultiplier={speedMultiplier}
              onChangeSpeed={(s) => setSpeedMultiplier(s)}
              viewOptions={viewOptions}
              onToggleViewOption={handleToggleViewOption}
              lang={lang}
            />

            {/* Gravity (g) Options Control Card */}
            <GravitySelector gValue={params.g} onChangeG={handleToggleG} lang={lang} />
          </div>

          {/* Center Column: Large Simulation Canvas & Position Inspector (6 Cols on XL, 8 Cols on LG) */}
          <div className="lg:col-span-8 xl:col-span-6 space-y-6">
            <SimulationCanvas
              params={params}
              currentState={currentState}
              viewOptions={viewOptions}
              onSelectTime={(t) => {
                setIsPlaying(false);
                setCurrentTime(t);
              }}
              isPlaying={isPlaying}
              onTogglePlay={() => {
                if (currentTime >= maxTime) {
                  setCurrentTime(0);
                }
                setIsPlaying(!isPlaying);
              }}
              onReset={handleReset}
              onStep={handleStep}
              currentTime={currentTime}
              maxTime={maxTime}
              onScrubTime={(t) => {
                setIsPlaying(false);
                setCurrentTime(t);
              }}
              speedMultiplier={speedMultiplier}
              onChangeSpeed={(s) => setSpeedMultiplier(s)}
              lang={lang}
            />

            {/* Position & Energy Inspector */}
            <PositionInspector
              params={params}
              currentState={currentState}
              onInspectTime={(t) => {
                setIsPlaying(false);
                setCurrentTime(t);
              }}
              lang={lang}
            />
          </div>

          {/* Right Column: Energy Distribution & Graph (3 Cols on XL, 12 Cols on LG) */}
          <div className="lg:col-span-12 xl:col-span-3 space-y-6">
            {/* Top Right: Energy Breakdown */}
            <EnergyBreakdown
              state={currentState}
              mass={params.mass}
              g={params.g}
              lang={lang}
            />

            {/* Bottom Right: Energy Graph */}
            <EnergyGraph params={params} currentTime={currentTime} lang={lang} />
          </div>
        </div>

        {/* Bottom Full-Width Table: Key Point Snapshots */}
        <KeyPointsTable
          params={params}
          currentTime={currentTime}
          onJumpToTime={(t) => {
            setIsPlaying(false);
            setCurrentTime(t);
          }}
          lang={lang}
        />
      </main>

      {/* Theory Guide Modal */}
      <ExplanationModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} lang={lang} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'bn'
              ? 'পদার্থবিজ্ঞান ল্যাব • যান্ত্রিক শক্তির সংরক্ষণশীলতা নীতি প্রদর্শনী (E_total = Ek + Ep = ধ্রুবক)'
              : 'Physics Education Lab • Demonstrating Conservation of Mechanical Energy (E_total = Ek + Ep = Constant)'}
          </span>
          <span className="font-mono text-slate-600 font-medium">
            x(t) = v₀·cos(θ)·t | y(t) = h₀ + v₀·sin(θ)·t - ½g·t²
          </span>
        </div>
      </footer>
    </div>
  );
}

