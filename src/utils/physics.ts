import { KeyPointSnapshot, PhysicsParams, SimulationSummary, StateAtTime } from '../types';

/**
 * Calculates kinematics and energy parameters at any timestamp t
 */
export function calculateStateAtTime(params: PhysicsParams, t: number): StateAtTime {
  const { h0, v0, angle, mass, g } = params;
  const rad = (angle * Math.PI) / 180;

  const vx0 = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);

  const tImpact = calculateFlightTime(params);
  const clampedT = Math.max(0, Math.min(t, tImpact));

  const x = vx0 * clampedT;
  const rawY = h0 + vy0 * clampedT - 0.5 * g * clampedT * clampedT;
  const y = Math.max(0, rawY);

  const vx = vx0;
  // If object hits the ground (clampedT === tImpact), vy is the velocity just before impact
  const vy = vy0 - g * clampedT;
  const v = Math.sqrt(vx * vx + vy * vy);

  const ek = 0.5 * mass * v * v;
  const ep = mass * g * y;
  const eTotal = ek + ep;

  const total = eTotal > 0 ? eTotal : 1;
  const ekPercent = Math.min(100, Math.max(0, (ek / total) * 100));
  const epPercent = Math.min(100, Math.max(0, (ep / total) * 100));

  return {
    t: clampedT,
    x,
    y,
    vx,
    vy,
    v,
    ek,
    ep,
    eTotal,
    ekPercent,
    epPercent,
  };
}

/**
 * Calculates total flight time until ground impact (y = 0)
 */
export function calculateFlightTime(params: PhysicsParams): number {
  const { h0, v0, angle, g } = params;
  const rad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(rad);

  // Solving: -0.5*g*t^2 + vy0*t + h0 = 0
  // 0.5*g*t^2 - vy0*t - h0 = 0
  const discriminant = vy0 * vy0 + 2 * g * h0;

  if (discriminant < 0) {
    return 0;
  }

  const t = (vy0 + Math.sqrt(discriminant)) / g;
  return Math.max(0, t);
}

/**
 * Computes maximum height achieved above ground and the time it occurs
 */
export function calculateMaxHeightInfo(params: PhysicsParams): { maxHeight: number; tMaxHeight: number } {
  const { h0, v0, angle, g } = params;
  const rad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(rad);

  if (vy0 <= 0) {
    // Launched horizontally or downwards: peak is the initial position
    return {
      maxHeight: h0,
      tMaxHeight: 0,
    };
  }

  const tMax = vy0 / g;
  const hMax = h0 + (vy0 * vy0) / (2 * g);

  return {
    maxHeight: hMax,
    tMaxHeight: tMax,
  };
}

/**
 * Computes full simulation summary including key point snapshots
 */
export function calculateSimulationSummary(params: PhysicsParams): SimulationSummary {
  const tImpact = calculateFlightTime(params);
  const { maxHeight, tMaxHeight } = calculateMaxHeightInfo(params);
  const rad = (params.angle * Math.PI) / 180;
  const vx0 = params.v0 * Math.cos(rad);
  const range = vx0 * tImpact;

  const launchState = calculateStateAtTime(params, 0);
  const apexState = calculateStateAtTime(params, tMaxHeight);
  const impactState = calculateStateAtTime(params, tImpact);

  const initialETotal = launchState.eTotal;

  const launchPoint: KeyPointSnapshot = {
    label: 'Launch Point',
    name: 'Point 1: Launch',
    t: 0,
    x: launchState.x,
    y: launchState.y,
    vx: launchState.vx,
    vy: launchState.vy,
    v: launchState.v,
    ek: launchState.ek,
    ep: launchState.ep,
    eTotal: launchState.eTotal,
    description: `Initial launch at t = 0s. Height = ${launchState.y.toFixed(1)}m, Speed = ${launchState.v.toFixed(1)}m/s.`,
  };

  const apexPoint: KeyPointSnapshot = {
    label: 'Max Height (Apex)',
    name: 'Point 2: Apex',
    t: tMaxHeight,
    x: apexState.x,
    y: apexState.y,
    vx: apexState.vx,
    vy: apexState.vy,
    v: apexState.v,
    ek: apexState.ek,
    ep: apexState.ep,
    eTotal: apexState.eTotal,
    description: vy0IsPositive(params)
      ? `Maximum height reached at t = ${tMaxHeight.toFixed(2)}s. Vertical velocity Vy = 0 m/s.`
      : `Top of trajectory is initial launch height (no upward launch component).`,
  };

  const impactPoint: KeyPointSnapshot = {
    label: 'Ground Impact',
    name: 'Point 3: Ground Impact',
    t: tImpact,
    x: impactState.x,
    y: impactState.y,
    vx: impactState.vx,
    vy: impactState.vy,
    v: impactState.v,
    ek: impactState.ek,
    ep: impactState.ep,
    eTotal: impactState.eTotal,
    description: `Hits ground at t = ${tImpact.toFixed(2)}s. Potential energy Ep = 0 J.`,
  };

  return {
    tImpact,
    maxHeight,
    tMaxHeight,
    range,
    vImpact: impactState.v,
    initialETotal,
    keyPoints: {
      launch: launchPoint,
      maxHeight: apexPoint,
      impact: impactPoint,
    },
  };
}

function vy0IsPositive(params: PhysicsParams): boolean {
  const rad = (params.angle * Math.PI) / 180;
  return params.v0 * Math.sin(rad) > 0;
}

/**
 * Generates trajectory points array for drawing on canvas or graphing
 */
export function generateTrajectoryPoints(params: PhysicsParams, numPoints = 100): StateAtTime[] {
  const tImpact = calculateFlightTime(params);
  if (tImpact <= 0) {
    return [calculateStateAtTime(params, 0)];
  }

  const points: StateAtTime[] = [];
  const dt = tImpact / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const t = Math.min(i * dt, tImpact);
    points.push(calculateStateAtTime(params, t));
  }

  return points;
}

/**
 * Finds trajectory time t corresponding to a given target X position in meters
 */
export function findTimeForTargetX(params: PhysicsParams, targetX: number): number {
  const tImpact = calculateFlightTime(params);
  const rad = (params.angle * Math.PI) / 180;
  const vx0 = params.v0 * Math.cos(rad);

  if (Math.abs(vx0) < 0.001) {
    // Pure vertical motion (Free fall or upward throw): x is always 0
    return 0;
  }

  const t = targetX / vx0;
  return Math.max(0, Math.min(t, tImpact));
}

/**
 * Finds trajectory time t corresponding to a given target Y height in meters
 */
export function findTimeForTargetY(
  params: PhysicsParams,
  targetY: number,
  preferDescending = false
): number {
  const { h0, v0, angle, g } = params;
  const tImpact = calculateFlightTime(params);
  const rad = (angle * Math.PI) / 180;
  const vy0 = v0 * Math.sin(rad);

  // Equation: -0.5 * g * t^2 + vy0 * t + h0 = targetY
  // 0.5 * g * t^2 - vy0 * t + (targetY - h0) = 0
  const a = 0.5 * g;
  const b = -vy0;
  const c = targetY - h0;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // Target Y is higher than max height: return apex time
    const { tMaxHeight } = calculateMaxHeightInfo(params);
    return Math.max(0, Math.min(tMaxHeight, tImpact));
  }

  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a); // Ascending root
  const t2 = (-b + sqrtD) / (2 * a); // Descending root

  const validRoots = [t1, t2].filter((t) => t >= 0 && t <= tImpact + 0.01);

  if (validRoots.length === 0) {
    return 0;
  }

  if (validRoots.length === 1) {
    return Math.max(0, Math.min(validRoots[0], tImpact));
  }

  // Two valid roots (ascending vs descending)
  const chosenT = preferDescending ? Math.max(...validRoots) : Math.min(...validRoots);
  return Math.max(0, Math.min(chosenT, tImpact));
}

/**
 * Default preset parameter values
 */
export const SCENARIO_PRESETS: Record<string, { label: string; description: string; params: PhysicsParams }> = {
  free_fall: {
    label: 'Free Fall (Poronto)',
    description: 'Object dropped straight down from initial height h0. Initial potential energy converts completely to kinetic energy as it falls.',
    params: {
      h0: 30,
      v0: 0,
      angle: -90,
      mass: 1,
      g: 9.8,
    },
  },
  upward_throw: {
    label: 'Upward Throw (Nikkhipto)',
    description: 'Object thrown vertically upward (+90°). Kinetic energy turns into Potential energy until v_y = 0 at apex, then falls back.',
    params: {
      h0: 0,
      v0: 20,
      angle: 90,
      mass: 1,
      g: 9.8,
    },
  },
  projectile_motion: {
    label: 'Projectile Motion (Prash)',
    description: 'Oblique launch at angle (e.g. 45°). Note: At maximum height, horizontal kinetic energy remains non-zero (0.5 * m * v_x^2)!',
    params: {
      h0: 10,
      v0: 18,
      angle: 45,
      mass: 1,
      g: 9.8,
    },
  },
};
