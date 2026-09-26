export interface KeyBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  letter: string;
  display: string;
}

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface HandData {
  landmarks: Landmark[];
  indexTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
  pinchDistance: number;
  isPinching: boolean;
}

export interface AnimeEffectInstance {
  name: 'BANKAI' | 'SHADOW CLONE';
  duration: number;
  startedAt: number;
  particles?: Particle[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const LETTERS = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R",
  "S", "T", "U", "V", "W", "X",
  "Y", "Z", "_", "<",
];
