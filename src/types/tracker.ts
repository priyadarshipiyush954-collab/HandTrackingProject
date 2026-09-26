export type HandGesture =
  | 'IDLE'
  | 'PINCH'
  | 'OPEN_PALM'
  | 'PEACE'
  | 'POINT'
  | 'FIST'
  | 'ROCK_ON'
  | 'THUMBS_UP';

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface HandData {
  landmarks: Landmark[];
  palmCenter: { x: number; y: number };
  palmSize: number;
  indexTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
  middleTip: { x: number; y: number };
  ringTip: { x: number; y: number };
  pinkyTip: { x: number; y: number };
  pinchDistance: number;
  isPinching: boolean;
  gesture: HandGesture;
  gestureConfidence: number;
}

export type BrushMode = 'NEON' | 'FIRE' | 'CELESTIAL' | 'CYBER' | 'RAINBOW';

export interface StrokePoint {
  x: number;
  y: number;
  color: string;
  size: number;
  brush: BrushMode;
  timestamp: number;
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
  type?: 'ember' | 'sakura' | 'spark' | 'star' | 'lightning' | 'smoke' | 'gravity' | string;
  rotation?: number;
  vRot?: number;
}

export interface KeyBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  letter: string;
  display: string;
}

export interface AnimeEffectInstance {
  name: 'BANKAI' | 'SHADOW CLONE';
  duration: number;
  startedAt: number;
  particles?: Particle[];
}

export const LETTERS = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R",
  "S", "T", "U", "V", "W", "X",
  "Y", "Z", "_", "<",
];

export interface GestureMetadata {
  id: HandGesture;
  name: string;
  symbol: string;
  keyAction: string;
  description: string;
  color: string;
  bgGlow: string;
}

export const GESTURE_DEFINITIONS: GestureMetadata[] = [
  {
    id: 'PINCH',
    name: 'Air Draw',
    symbol: '👌',
    keyAction: 'Pinch Index & Thumb',
    description: 'Pinch fingertips close to sketch glowing air-trails or tap keys',
    color: '#06b6d4',
    bgGlow: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'POINT',
    name: 'Plasma Laser',
    symbol: '👉',
    keyAction: 'Extend Index Only',
    description: 'Aim index finger to project a focused particle laser beam',
    color: '#3b82f6',
    bgGlow: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 'OPEN_PALM',
    name: 'Force Field',
    symbol: '✋',
    keyAction: 'Open All 5 Fingers',
    description: 'Repels and scatters floating particles with a cosmic energy wave',
    color: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'PEACE',
    name: 'Domain Sakura',
    symbol: '✌️',
    keyAction: 'Index & Middle (V-Sign)',
    description: 'Summons a serene domain storm of drifting luminous cherry petals',
    color: '#ec4899',
    bgGlow: 'rgba(236, 72, 153, 0.4)',
  },
  {
    id: 'FIST',
    name: 'Bankai Singularity',
    symbol: '✊',
    keyAction: 'Clench All Fingers',
    description: 'Creates a black-hole gravitational vortex that drags strokes inward',
    color: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.4)',
  },
  {
    id: 'ROCK_ON',
    name: 'Fire Dragon',
    symbol: '🤘',
    keyAction: 'Index & Pinky Extended',
    description: 'Erupts intense mythical firestorm embers that swirl around your hand',
    color: '#f97316',
    bgGlow: 'rgba(249, 115, 22, 0.4)',
  },
  {
    id: 'THUMBS_UP',
    name: 'Supernova Burst',
    symbol: '👍',
    keyAction: 'Thumb Upward Alone',
    description: 'Fires dazzling golden star fireworks and celestial rainbow chimes',
    color: '#eab308',
    bgGlow: 'rgba(234, 179, 8, 0.4)',
  },
];
