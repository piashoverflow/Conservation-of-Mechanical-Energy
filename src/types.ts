export interface PhysicsParams {
  h0: number; // Initial height in meters (0 to 100)
  v0: number; // Initial velocity in m/s (0 to 50)
  angle: number; // Launch angle in degrees (-90 to 90)
  mass: number; // Mass in kg (0.1 to 10)
  g: number; // Gravitational acceleration (9.8 or 10.0 m/s^2)
}

export type PresetScenario = 'free_fall' | 'upward_throw' | 'projectile_motion' | 'custom';

export interface StateAtTime {
  t: number; // Current time in seconds
  x: number; // x position in meters
  y: number; // y position in meters
  vx: number; // x velocity component in m/s
  vy: number; // y velocity component in m/s
  v: number; // Total velocity in m/s
  ek: number; // Kinetic energy in Joules
  ep: number; // Potential energy in Joules
  eTotal: number; // Total mechanical energy in Joules
  ekPercent: number; // Kinetic energy percentage (0-100)
  epPercent: number; // Potential energy percentage (0-100)
}

export interface KeyPointSnapshot {
  label: string;
  name: string;
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  v: number;
  ek: number;
  ep: number;
  eTotal: number;
  description: string;
}

export interface SimulationSummary {
  tImpact: number;
  maxHeight: number;
  tMaxHeight: number;
  range: number;
  vImpact: number;
  initialETotal: number;
  keyPoints: {
    launch: KeyPointSnapshot;
    maxHeight: KeyPointSnapshot;
    impact: KeyPointSnapshot;
  };
}

export interface ViewOptions {
  showTrajectory: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showTrail: boolean;
  autoScale: boolean;
  soundEnabled: boolean;
}
