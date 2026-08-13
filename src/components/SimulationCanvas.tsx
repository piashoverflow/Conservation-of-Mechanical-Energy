import React, { useEffect, useRef, useState } from 'react';
import { PhysicsParams, StateAtTime, ViewOptions } from '../types';
import {
  calculateFlightTime,
  calculateMaxHeightInfo,
  calculateStateAtTime,
  generateTrajectoryPoints,
} from '../utils/physics';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface SimulationCanvasProps {
  params: PhysicsParams;
  currentState: StateAtTime;
  viewOptions: ViewOptions;
  onSelectTime?: (t: number) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onReset?: () => void;
  onStep?: (deltaSeconds: number) => void;
  currentTime?: number;
  maxTime?: number;
  onScrubTime?: (t: number) => void;
  speedMultiplier?: number;
  onChangeSpeed?: (speed: number) => void;
  lang?: Language;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  params,
  currentState,
  viewOptions,
  onSelectTime,
  isPlaying = false,
  onTogglePlay,
  onReset,
  onStep,
  currentTime = 0,
  maxTime = 1,
  onScrubTime,
  speedMultiplier = 1,
  onChangeSpeed,
  lang = 'en',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; t: number; cx: number; cy: number } | null>(null);

  const t = translations[lang];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI display sharpness
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear background - Bright clean canvas
    ctx.fillStyle = '#f8fafc'; // slate-50
    ctx.fillRect(0, 0, width, height);

    // Calculate max bounds for coordinate system auto-scaling
    const tImpact = calculateFlightTime(params);
    const { maxHeight, tMaxHeight } = calculateMaxHeightInfo(params);
    const rad = (params.angle * Math.PI) / 180;
    const range = Math.max(1, params.v0 * Math.cos(rad) * tImpact);

    // Give 25% margin around the trajectory
    const maxX = Math.max(12, range * 1.25);
    const maxY = Math.max(12, maxHeight * 1.3, params.h0 * 1.25);

    // For 1D vertical drops (range < 3m), give 110px left padding so axes & pins don't crowd the left border
    const paddingLeft = range < 3 ? 110 : 70;
    const paddingBottom = 50;
    const paddingTop = 45;
    const paddingRight = 45;

    const scaleX = (width - paddingLeft - paddingRight) / maxX;
    const scaleY = (height - paddingTop - paddingBottom) / maxY;
    // Use uniform scale to maintain 1:1 physical aspect ratio
    const scale = Math.min(scaleX, scaleY);

    const toCanvasX = (physX: number) => paddingLeft + physX * scale;
    const toCanvasY = (physY: number) => height - paddingBottom - physY * scale;

    // --- 1. Draw Distance Grid & Axes ---
    if (viewOptions.showGrid) {
      ctx.strokeStyle = '#e2e8f0'; // slate-200
      ctx.lineWidth = 1;

      // Vertical Grid Ticks (meters x)
      const xStep = getGridStep(maxX);
      for (let xMeters = 0; xMeters <= maxX; xMeters += xStep) {
        const cx = toCanvasX(xMeters);
        ctx.beginPath();
        ctx.moveTo(cx, paddingTop);
        ctx.lineTo(cx, height - paddingBottom);
        ctx.stroke();

        ctx.fillStyle = '#334155'; // slate-700
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${xMeters}m`, cx, height - paddingBottom + 18);
      }

      // Horizontal Grid Ticks (meters y)
      const yStep = getGridStep(maxY);
      for (let yMeters = 0; yMeters <= maxY; yMeters += yStep) {
        const cy = toCanvasY(yMeters);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, cy);
        ctx.lineTo(width - paddingRight, cy);
        ctx.stroke();

        ctx.fillStyle = '#334155'; // slate-700
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${yMeters}m`, paddingLeft - 8, cy + 4);
      }
    }

    // --- 2. Ground Line & Cliff Pedestal ---
    const groundY = toCanvasY(0);

    // Ground fill
    ctx.fillStyle = '#f1f5f9'; // slate-100
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground top border
    ctx.strokeStyle = '#059669'; // emerald-600
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Active ball pixel position
    const ballX = toCanvasX(currentState.x);
    const ballY = toCanvasY(currentState.y);

    // Cliff / Platform under launch height
    if (params.h0 > 0) {
      const platformWidth = 40;
      const platformX = toCanvasX(0) - platformWidth / 2;
      const platformY = toCanvasY(params.h0);

      ctx.fillStyle = '#e2e8f0'; // slate-200
      ctx.fillRect(platformX, platformY, platformWidth, groundY - platformY);
      ctx.strokeStyle = '#cbd5e1'; // slate-300
      ctx.lineWidth = 1.5;
      ctx.strokeRect(platformX, platformY, platformWidth, groundY - platformY);

      // Height Marker on Cliff
      ctx.fillStyle = '#0284c7'; // sky-600
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`h₀ = ${params.h0}m`, platformX - 8, (platformY + groundY) / 2);
    }

    // --- 3. Full Trajectory Line (Covered = Solid, Remaining = Dashed) ---
    const trajectoryPoints = generateTrajectoryPoints(params, 140);

    if (viewOptions.showTrajectory && trajectoryPoints.length > 1) {
      // 1. Covered Trajectory Segment (SOLID Line up to current position)
      ctx.save();
      ctx.beginPath();
      let coveredCount = 0;
      for (let i = 0; i < trajectoryPoints.length; i++) {
        const pt = trajectoryPoints[i];
        if (i === 0) {
          ctx.moveTo(toCanvasX(pt.x), toCanvasY(pt.y));
          coveredCount++;
        } else if (pt.t <= currentState.t) {
          ctx.lineTo(toCanvasX(pt.x), toCanvasY(pt.y));
          coveredCount++;
        } else {
          // Connect directly to current ball position
          ctx.lineTo(ballX, ballY);
          coveredCount++;
          break;
        }
      }
      if (coveredCount > 1) {
        ctx.strokeStyle = '#0284c7'; // sky-600 solid
        ctx.lineWidth = 3.5;
        ctx.setLineDash([]); // SOLID LINE
        ctx.stroke();
      }
      ctx.restore();

      // 2. Unreached / Remaining Trajectory Segment (DASHED Line)
      ctx.save();
      ctx.beginPath();
      let hasUnreached = false;
      for (let i = 0; i < trajectoryPoints.length; i++) {
        const pt = trajectoryPoints[i];
        if (pt.t >= currentState.t) {
          if (!hasUnreached) {
            ctx.moveTo(toCanvasX(pt.x), toCanvasY(pt.y));
            hasUnreached = true;
          } else {
            ctx.lineTo(toCanvasX(pt.x), toCanvasY(pt.y));
          }
        }
      }
      if (hasUnreached) {
        ctx.strokeStyle = '#94a3b8'; // slate-400
        ctx.lineWidth = 2.0;
        ctx.setLineDash([5, 5]); // DASHED
        ctx.stroke();
      }
      ctx.restore();

      // Draw trail dots
      if (viewOptions.showTrail) {
        trajectoryPoints.forEach((pt, idx) => {
          if (idx % 6 === 0) {
            const isCovered = pt.t <= currentState.t;
            ctx.fillStyle = isCovered ? '#0284c7' : '#cbd5e1';
            ctx.beginPath();
            ctx.arc(toCanvasX(pt.x), toCanvasY(pt.y), isCovered ? 3.5 : 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
    }

    // --- 4. Critical Point Snapshots / Markers ---
    const launchState = calculateStateAtTime(params, 0);
    const apexState = calculateStateAtTime(params, tMaxHeight);
    const impactState = calculateStateAtTime(params, tImpact);

    // Launch Pin: elevated & left offset
    const launchLabel = lang === 'bn' ? '১. নিক্ষেপ' : '1. Launch';
    drawPinMarker(ctx, toCanvasX(launchState.x), toCanvasY(launchState.y), '#0284c7', launchLabel, -26);

    // Apex Pin: elevated strictly above peak
    if (tMaxHeight > 0 && tMaxHeight < tImpact && params.angle > 0) {
      const apexLabel = lang === 'bn' ? `২. সর্বোচ্চ (${maxHeight.toFixed(1)}m)` : `2. Apex (${maxHeight.toFixed(1)}m)`;
      drawPinMarker(ctx, toCanvasX(apexState.x), toCanvasY(apexState.y), '#d97706', apexLabel, -26);
    }

    // Impact Pin: placed below ground line so force vectors pointing to ground never overlap
    if (tImpact > 0) {
      const impactLabel = lang === 'bn' ? `৩. ভূমি স্পর্শ (${range.toFixed(1)}m)` : `3. Impact (${range.toFixed(1)}m)`;
      drawPinMarker(ctx, toCanvasX(impactState.x), groundY + 18, '#dc2626', impactLabel, 0);
    }

    // --- 5. Coordinate Projections to Axes (when inspecting / moving) ---
    ctx.save();
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    // Vertical Projection down to Ground
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX, groundY);
    ctx.stroke();

    // Horizontal Projection left to Y axis
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(paddingLeft, ballY);
    ctx.stroke();
    ctx.restore();

    // Coordinate axis badges
    drawMiniAxisBadge(ctx, `${currentState.x.toFixed(1)}m`, ballX, height - paddingBottom + 4, '#0284c7');
    drawMiniAxisBadge(ctx, `${currentState.y.toFixed(1)}m`, paddingLeft - 4, ballY, '#d97706', true);

    // --- 6. Moving Ball Object ---
    const ballRadius = Math.max(9, Math.min(18, 9 + params.mass * 0.9));

    // Glow Effect
    const glow = ctx.createRadialGradient(ballX, ballY, 2, ballX, ballY, ballRadius * 2.2);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    glow.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Ball Core
    const ballGrad = ctx.createRadialGradient(
      ballX - ballRadius * 0.3,
      ballY - ballRadius * 0.3,
      ballRadius * 0.1,
      ballX,
      ballY,
      ballRadius
    );
    ballGrad.addColorStop(0, '#34d399'); // emerald-400
    ballGrad.addColorStop(1, '#047857'); // emerald-700

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- 7. Velocity & Gravity Vector Arrows (High Contrast & Clear Offsets - NO BOXES) ---
    if (viewOptions.showVectors && currentState.t <= tImpact) {
      // Dynamic Vector scale factor - Prominent, larger scale factor
      const vectorScale = Math.min(8.5, Math.max(4.8, (height * 0.16) / Math.max(1, currentState.v)));

      // Vx Vector (Sky Blue - Horizontal)
      if (Math.abs(currentState.vx) > 0.1) {
        drawCleanVector(
          ctx,
          ballX,
          ballY,
          ballX + currentState.vx * vectorScale,
          ballY,
          '#0284c7', // sky-600
          `Vx = ${currentState.vx.toFixed(1)} m/s`,
          'above'
        );
      }

      // Vy Vector (Orange - Vertical)
      if (Math.abs(currentState.vy) > 0.1) {
        drawCleanVector(
          ctx,
          ballX,
          ballY,
          ballX,
          ballY - currentState.vy * vectorScale, // Canvas Y inverted
          '#ea580c', // orange-600
          `Vy = ${currentState.vy.toFixed(1)} m/s`,
          'left'
        );
      }

      // V Resultant Vector (Emerald - Diagonal)
      drawCleanVector(
        ctx,
        ballX,
        ballY,
        ballX + currentState.vx * vectorScale,
        ballY - currentState.vy * vectorScale,
        '#059669', // emerald-600
        `V = ${currentState.v.toFixed(1)} m/s`,
        'tip'
      );

      // Acceleration / Gravity Vector (Purple - Downward)
      const gPixelLength = Math.min(85, params.g * 5.5);
      drawCleanVector(
        ctx,
        ballX,
        ballY,
        ballX,
        ballY + gPixelLength,
        '#7c3aed', // purple-600
        `g = ${params.g} m/s²`,
        'right'
      );
    }

    // --- 8. Mouse Hover Preview Indicator ---
    if (hoverInfo) {
      ctx.save();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.arc(hoverInfo.cx, hoverInfo.cy, 8, 0, Math.PI * 2);
      ctx.stroke();

      drawBadgePill(
        ctx,
        lang === 'bn'
          ? `ক্লিক করুন: (${hoverInfo.x.toFixed(1)}m, ${hoverInfo.y.toFixed(1)}m)`
          : `Click to Freeze: (${hoverInfo.x.toFixed(1)}m, ${hoverInfo.y.toFixed(1)}m)`,
        hoverInfo.cx,
        hoverInfo.cy - 18,
        '#0f172a',
        '#ffffff'
      );
      ctx.restore();
    }
  }, [params, currentState, viewOptions, hoverInfo, lang]);

  // Handle Mouse Hover on Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickXPx = e.clientX - rect.left;
    const clickYPx = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const tImpact = calculateFlightTime(params);
    const { maxHeight } = calculateMaxHeightInfo(params);
    const rad = (params.angle * Math.PI) / 180;
    const range = Math.max(1, params.v0 * Math.cos(rad) * tImpact);

    const maxX = Math.max(12, range * 1.25);
    const maxY = Math.max(12, maxHeight * 1.3, params.h0 * 1.25);

    const paddingLeft = range < 3 ? 110 : 70;
    const paddingBottom = 50;
    const paddingTop = 45;
    const paddingRight = 45;

    const scaleX = (width - paddingLeft - paddingRight) / maxX;
    const scaleY = (height - paddingTop - paddingBottom) / maxY;
    const scale = Math.min(scaleX, scaleY);

    const trajectoryPoints = generateTrajectoryPoints(params, 100);
    let closestPt = trajectoryPoints[0];
    let minDist = Infinity;

    trajectoryPoints.forEach((pt) => {
      const cx = paddingLeft + pt.x * scale;
      const cy = height - paddingBottom - pt.y * scale;
      const dist = Math.hypot(clickXPx - cx, clickYPx - cy);
      if (dist < minDist) {
        minDist = dist;
        closestPt = pt;
      }
    });

    if (minDist < 60) {
      const cx = paddingLeft + closestPt.x * scale;
      const cy = height - paddingBottom - closestPt.y * scale;
      setHoverInfo({ x: closestPt.x, y: closestPt.y, t: closestPt.t, cx, cy });
    } else {
      setHoverInfo(null);
    }
  };

  // Handle Canvas Click to Select Time
  const handleCanvasClick = () => {
    if (hoverInfo && onSelectTime) {
      onSelectTime(hoverInfo.t);
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[650px] xl:h-[700px] bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Interactive Physics Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverInfo(null)}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Top Floating Control Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none z-20">
        {/* Left: Live Telemetry & Scrub Bar */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 text-xs font-mono space-y-1 text-slate-800 shadow-md pointer-events-auto max-w-xs sm:max-w-sm">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-800">
              {t.pos}: <strong className="text-sky-700">({currentState.x.toFixed(1)}m, {currentState.y.toFixed(1)}m)</strong>
            </span>
            <span className="font-semibold text-slate-800">
              {t.t}: <strong className="text-emerald-700">{currentState.t.toFixed(2)}s</strong> / {calculateFlightTime(params).toFixed(2)}s
            </span>
          </div>

          {/* Compact Scrub Slider */}
          {onScrubTime && (
            <div className="pt-0.5">
              <input
                type="range"
                min={0}
                max={calculateFlightTime(params) || 0.1}
                step={0.01}
                value={currentState.t}
                onChange={(e) => onScrubTime(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Top Right: Play, Pause, Step Forward, Step Backward, Reset buttons */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/90 shadow-md pointer-events-auto flex items-center gap-1.5 ml-auto">
          {/* Reset */}
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200/80 active:scale-95"
              title={t.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Pichone (Step Back) */}
          {onStep && (
            <button
              onClick={() => onStep(-0.05)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200/80 active:scale-95 flex items-center gap-1 text-xs font-bold"
              title={t.stepBackward}
            >
              <SkipBack className="w-4 h-4" />
            </button>
          )}

          {/* Play / Pause Primary Button */}
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" /> {t.pause}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> {t.play}
                </>
              )}
            </button>
          )}

          {/* Shamne (Step Forward) */}
          {onStep && (
            <button
              onClick={() => onStep(0.05)}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200/80 active:scale-95 flex items-center gap-1 text-xs font-bold"
              title={t.stepForward}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Vector Legend Badge - Positioned below the top controls so it doesn't overlap */}
      {viewOptions.showVectors && (
        <div className="absolute top-16 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5 text-slate-800 shadow-md pointer-events-none z-10">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 border-b border-slate-100 pb-1">
            {t.vectorLegendTitle}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs" />
            <span className="font-semibold text-emerald-800">{t.totalVelocity}: {currentState.v.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-600 inline-block shadow-xs" />
            <span className="font-semibold text-sky-800">{t.horizVelocity}: {currentState.vx.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-600 inline-block shadow-xs" />
            <span className="font-semibold text-orange-800">{t.vertVelocity}: {currentState.vy.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shadow-xs" />
            <span className="font-semibold text-purple-800">{t.gravityTitle}: {params.g} m/s²</span>
          </div>
        </div>
      )}
    </div>
  );
};


// Helper function to draw grid step sizes logically
function getGridStep(maxVal: number): number {
  if (maxVal <= 15) return 2;
  if (maxVal <= 30) return 5;
  if (maxVal <= 80) return 10;
  if (maxVal <= 200) return 20;
  return 50;
}

// Helper to draw pin location marker with pill badge
function drawPinMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
  offsetY: number
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawBadgePill(ctx, label, x, y + offsetY, color, '#ffffff');
  ctx.restore();
}

// Helper to draw clean vector arrow with high-contrast text and NO box background
function drawCleanVector(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  label: string,
  textPosition: 'above' | 'left' | 'right' | 'tip'
) {
  const headLen = 12; // Prominent large arrow head
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 4) return;

  ctx.save();

  // White outline shaft for maximum contrast
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Color Shaft
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Arrow Head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  // Calculate Text Offset
  let labelX = toX;
  let labelY = toY;
  let align: CanvasTextAlign = 'center';
  let baseline: CanvasTextBaseline = 'middle';

  switch (textPosition) {
    case 'above':
      labelX = (fromX + toX) / 2;
      labelY = fromY - 12;
      align = 'center';
      baseline = 'bottom';
      break;
    case 'left':
      labelX = fromX - 12;
      labelY = (fromY + toY) / 2;
      align = 'right';
      baseline = 'middle';
      break;
    case 'right':
      labelX = fromX + 12;
      labelY = (fromY + toY) / 2;
      align = 'left';
      baseline = 'middle';
      break;
    case 'tip':
      labelX = toX + 10;
      labelY = toY - 8;
      align = 'left';
      baseline = 'bottom';
      break;
  }

  // Draw High-Contrast Text with White Outline Stroke (NO BOX)
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeText(label, labelX, labelY);

  ctx.fillStyle = color;
  ctx.fillText(label, labelX, labelY);

  ctx.restore();
}

// Helper to draw clean badge pill
function drawBadgePill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  bgColor: string,
  textColor: string,
  borderColor = '#cbd5e1'
) {
  ctx.save();
  ctx.font = 'bold 11px monospace';
  const metrics = ctx.measureText(text);
  const paddingX = 6;
  const paddingY = 3;
  const w = metrics.width + paddingX * 2;
  const h = 18;

  const rectX = x - w / 2;
  const rectY = y - h / 2;
  const radius = 5;

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.roundRect(rectX, rectY, w, h, radius);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Helper to draw axis labels
function drawMiniAxisBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  isLeft = false
) {
  ctx.save();
  ctx.font = 'bold 10px monospace';
  const metrics = ctx.measureText(text);
  const w = metrics.width + 8;
  const h = 16;

  const rectX = isLeft ? x - w : x - w / 2;
  const rectY = y - h / 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(rectX, rectY, w, h, 4);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, rectX + w / 2, y);
  ctx.restore();
}
