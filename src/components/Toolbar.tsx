import React from 'react';
import { Camera, MousePointer, VideoOff, RefreshCw, Palette } from 'lucide-react';

interface ToolbarProps {
  brushColor: string;
  onChangeColor: (color: string) => void;
  brushSize: number;
  onChangeSize: (size: number) => void;
  isWebcamActive: boolean;
  onToggleWebcam: () => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  webcamOpacity: number;
  onChangeWebcamOpacity: (opacity: number) => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  onRunDemoScript: () => void;
}

const PRESET_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Neon Cyan', hex: '#00dcff' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Electric Gold', hex: '#eab308' },
  { name: 'Sakura Pink', hex: '#ec4899' },
  { name: 'Acid Lime', hex: '#22c55e' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  brushColor,
  onChangeColor,
  brushSize,
  onChangeSize,
  isWebcamActive,
  onToggleWebcam,
  isSimulated,
  onToggleSimulated,
  webcamOpacity,
  onChangeWebcamOpacity,
  isMirrored,
  onToggleMirror,
  onRunDemoScript,
}) => {
  return (
    <div className="bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Colors & Brush Size */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-400 font-mono text-[11px] uppercase">Brush:</span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-neutral-800">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => onChangeColor(c.hex)}
                title={c.name}
                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                  brushColor === c.hex ? 'scale-115 ring-2 ring-white ring-offset-1 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Thickness slider */}
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min="2"
            max="18"
            value={brushSize}
            onChange={(e) => onChangeSize(Number(e.target.value))}
            className="w-16 accent-cyan-400 cursor-pointer"
            title={`Brush size: ${brushSize}px`}
          />
          <span className="font-mono text-neutral-400 w-6">{brushSize}px</span>
        </div>
      </div>

      {/* Camera / Feed / Mirror Controls */}
      <div className="flex items-center gap-2">
        {/* Camera toggle */}
        <button
          onClick={onToggleWebcam}
          className={`px-2.5 py-1 rounded font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            isWebcamActive
              ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              : 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-700'
          }`}
        >
          {isWebcamActive ? <VideoOff className="w-3.5 h-3.5 text-red-400" /> : <Camera className="w-3.5 h-3.5" />}
          <span>{isWebcamActive ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        {/* Mouse Mode toggle */}
        <button
          onClick={onToggleSimulated}
          className={`px-2.5 py-1 rounded font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            isSimulated
              ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
          }`}
          title="Enable mouse/touch simulation mode (Click/Space to pinch)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Mouse Mode: {isSimulated ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mirror Feed */}
        <button
          onClick={onToggleMirror}
          className={`px-2 py-1 rounded border text-neutral-300 hover:bg-neutral-800 transition-all cursor-pointer ${
            isMirrored ? 'border-cyan-800 bg-neutral-800 text-cyan-300' : 'border-neutral-700 bg-neutral-900'
          }`}
          title="Mirror video feed horizontally"
        >
          Flip Mirror
        </button>

        {/* Video feed opacity slider */}
        {isWebcamActive && (
          <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
            <span>Video Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={webcamOpacity}
              onChange={(e) => onChangeWebcamOpacity(Number(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
          </div>
        )}

        {/* Demo Hand auto-play */}
        <button
          onClick={onRunDemoScript}
          className="px-2.5 py-1 rounded bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-medium border border-purple-500/50 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          title="Run automated hand demo to type BANKAI and draw"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Auto Demo</span>
        </button>
      </div>
    </div>
  );
};
