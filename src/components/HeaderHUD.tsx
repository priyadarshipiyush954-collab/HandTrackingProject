import React from 'react';
import { Camera, Sparkles, Wand2, Activity, Volume2, VolumeX, Eraser, Download } from 'lucide-react';

interface HeaderHUDProps {
  command: string;
  isWebcamActive: boolean;
  handDetected: boolean;
  fps: number;
  pinchDistance: number;
  isPinching: boolean;
  isSimulated: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClear: () => void;
  onTriggerBankai: () => void;
  onTriggerShadowClone: () => void;
  onSaveCanvas: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  command,
  isWebcamActive,
  handDetected,
  fps,
  pinchDistance,
  isPinching,
  isSimulated,
  soundEnabled,
  onToggleSound,
  onClear,
  onTriggerBankai,
  onTriggerShadowClone,
  onSaveCanvas,
}) => {
  return (
    <header className="w-full bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm z-30 select-none">
      {/* Title & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-black tracking-wider text-base">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500/50" />
          <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            ANIME BOARD
          </span>
        </div>

        {/* Status badges */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1.5 ${
            isWebcamActive ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
          }`}>
            <Camera className="w-3 h-3" />
            {isWebcamActive ? (handDetected ? 'Hand Tracked' : 'Searching Hand...') : (isSimulated ? 'Mouse/Touch Mode' : 'Camera Off')}
          </span>

          <span className="px-2 py-0.5 rounded font-mono bg-neutral-800/80 text-neutral-300 border border-neutral-700/60 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            {fps} FPS
          </span>

          {handDetected && (
            <span className={`px-2 py-0.5 rounded font-mono text-xs border ${
              isPinching ? 'bg-red-950/80 text-red-300 border-red-800/60 font-bold' : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60'
            }`}>
              Pinch: {Math.round(pinchDistance)}px {isPinching ? '⚡ ACTIVE' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Center Command Terminal Box */}
      <div className="flex-1 max-w-md min-w-[200px]">
        <div className="flex items-center justify-between bg-black/75 px-3 py-1.5 rounded-lg border border-neutral-700">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">CMD:</span>
            <span className="font-mono font-bold text-cyan-400 tracking-wider truncate">
              {command ? command : <span className="text-neutral-500 italic font-normal text-xs">Pinch keys to type or air-draw...</span>}
            </span>
          </div>
          {command && (
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              {command.length} chars
            </span>
          )}
        </div>
      </div>

      {/* Right Controls: Triggers & Tools */}
      <div className="flex items-center gap-2">
        {/* Quick Jutsu / Anime Triggers */}
        <button
          onClick={onTriggerBankai}
          title="Trigger Bankai animation"
          className="px-2.5 py-1 text-xs font-bold rounded bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-sm shadow-red-700/40 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>BANKAI</span>
        </button>

        <button
          onClick={onTriggerShadowClone}
          title="Trigger Shadow Clone animation"
          className="px-2.5 py-1 text-xs font-bold rounded bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white shadow-sm shadow-sky-700/40 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Wand2 className="w-3 h-3" />
          <span>CLONES</span>
        </button>

        {/* Clear Button */}
        <button
          onClick={onClear}
          title="Clear canvas (or press 'C')"
          className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          <Eraser className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">Clear (C)</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          className={`p-1.5 rounded border active:scale-95 transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-neutral-800 border-neutral-700 text-cyan-400 hover:bg-neutral-700'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:bg-neutral-800'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Save Canvas */}
        <button
          onClick={onSaveCanvas}
          title="Save drawing as PNG"
          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
