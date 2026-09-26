import React from 'react';
import { Volume2, VolumeX, HelpCircle, Sparkles } from 'lucide-react';
import { HandGesture } from '../types/tracker';

interface HeaderHUDProps {
  activeGesture: HandGesture;
  isWebcamActive: boolean;
  handDetected: boolean;
  fps: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShowHelp: () => void;
  onSelectGesture: (gesture: HandGesture) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  activeGesture,
  isWebcamActive,
  handDetected,
  fps,
  soundEnabled,
  onToggleSound,
  onShowHelp,
  onSelectGesture,
}) => {
  return (
    <header className="w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-2.5 flex items-center justify-between gap-4 z-30 select-none text-xs">
      {/* Brand Title & Unboxed Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
          <span className="font-bold text-sm tracking-wide text-white font-mono">
            AETHERIA
          </span>
          <span className="text-neutral-500 font-mono text-[11px]">·</span>
          <span className="text-neutral-400 text-xs hidden sm:inline">
            Interactive Hand Gesture Studio
          </span>
        </div>

        {/* Live telemetry as unboxed inline text */}
        <div className="hidden md:flex items-center gap-2 text-neutral-400 text-[11px] font-mono pl-3 border-l border-neutral-800">
          <span className={handDetected ? 'text-emerald-400 font-semibold' : 'text-neutral-500'}>
            {handDetected ? 'Hand Locked' : isWebcamActive ? 'Scanning...' : 'Camera Inactive'}
          </span>
          <span className="text-neutral-600">·</span>
          <span>{fps} FPS</span>
        </div>
      </div>

      {/* Center: Active Gesture Highlight */}
      <div className="flex items-center gap-2 bg-neutral-900/90 px-3 py-1 rounded-lg border border-neutral-800">
        <span className="text-neutral-400 font-mono text-[11px] uppercase">Gesture:</span>
        <span className="font-bold text-cyan-300 font-mono tracking-wider flex items-center gap-1.5">
          <span>{getEmojiForGesture(activeGesture)}</span>
          <span>{activeGesture.replace('_', ' ')}</span>
        </span>
      </div>

      {/* Right Controls: Quick Special Effects & Sound */}
      <div className="flex items-center gap-2">
        {/* Quick anime / special effect buttons */}
        <button
          onClick={() => onSelectGesture('FIST')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 transition-all cursor-pointer"
          title="Bankai Singularity (Fist)"
        >
          <Sparkles className="w-3 h-3 text-red-400" />
          <span>Bankai</span>
        </button>

        <button
          onClick={() => onSelectGesture('PEACE')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 border border-pink-800/60 transition-all cursor-pointer"
          title="Sakura Domain (Peace sign)"
        >
          <span>🌸</span>
          <span>Domain</span>
        </button>

        <button
          onClick={() => onSelectGesture('ROCK_ON')}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 transition-all cursor-pointer"
          title="Fire Dragon (Rock On)"
        >
          <span>🔥</span>
          <span>Dragon</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable audio feedback'}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-neutral-800 border-neutral-700 text-cyan-400 hover:bg-neutral-700'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Help button */}
        <button
          onClick={onShowHelp}
          title="Gesture Guide & Controls"
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

function getEmojiForGesture(g: HandGesture): string {
  switch (g) {
    case 'PINCH': return '👌';
    case 'POINT': return '👉';
    case 'OPEN_PALM': return '✋';
    case 'PEACE': return '✌️';
    case 'FIST': return '✊';
    case 'ROCK_ON': return '🤘';
    case 'THUMBS_UP': return '👍';
    default: return '🖐️';
  }
}
