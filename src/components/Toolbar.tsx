import React from 'react';
import {
  Camera,
  MousePointer,
  VideoOff,
  Palette,
  Sparkles,
  Flame,
  Wand2,
  Rainbow,
  Terminal,
  Eraser,
  Download,
} from 'lucide-react';
import { BrushMode } from '../types/tracker';

interface ToolbarProps {
  brushMode: BrushMode;
  onChangeBrushMode: (mode: BrushMode) => void;
  brushColor: string;
  onChangeColor: (color: string) => void;
  brushSize: number;
  onChangeSize: (size: number) => void;
  isWebcamActive: boolean;
  onToggleWebcam: () => void;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  showKeyboard: boolean;
  onToggleKeyboard: () => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  onClear: () => void;
  onSaveCanvas: () => void;
}

const BRUSH_STYLES: { id: BrushMode; name: string; icon: React.ReactNode }[] = [
  { id: 'NEON', name: 'Neon Laser', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> },
  { id: 'FIRE', name: 'Fire Dragon', icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'CELESTIAL', name: 'Celestial', icon: <Wand2 className="w-3.5 h-3.5 text-purple-400" /> },
  { id: 'RAINBOW', name: 'Rainbow', icon: <Rainbow className="w-3.5 h-3.5 text-rose-400" /> },
  { id: 'CYBER', name: 'Cyber Ink', icon: <Palette className="w-3.5 h-3.5 text-emerald-400" /> },
];

const PRESET_COLORS = [
  { name: 'Neon Cyan', hex: '#06b6d4' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Electric Gold', hex: '#eab308' },
  { name: 'Sakura Pink', hex: '#ec4899' },
  { name: 'Acid Lime', hex: '#10b981' },
  { name: 'Pure White', hex: '#ffffff' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  brushMode,
  onChangeBrushMode,
  brushColor,
  onChangeColor,
  brushSize,
  onChangeSize,
  isWebcamActive,
  onToggleWebcam,
  isSimulated,
  onToggleSimulated,
  showKeyboard,
  onToggleKeyboard,
  isMirrored,
  onToggleMirror,
  onClear,
  onSaveCanvas,
}) => {
  return (
    <footer className="w-full bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-30 select-none">
      {/* Left: Brush Styles & Color Picker */}
      <div className="flex items-center gap-3">
        {/* Brush style tabs */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-lg border border-neutral-800">
          {BRUSH_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onChangeBrushMode(style.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                brushMode === style.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {style.icon}
              <span className="hidden sm:inline">{style.name}</span>
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-lg border border-neutral-800">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onChangeColor(c.hex)}
              title={c.name}
              className={`w-4.5 h-4.5 rounded-full transition-transform cursor-pointer ${
                brushColor === c.hex
                  ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-neutral-950'
                  : 'opacity-70 hover:opacity-100 hover:scale-110'
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="hidden lg:flex items-center gap-2 text-neutral-400 pl-1">
          <span>Size:</span>
          <input
            type="range"
            min="3"
            max="24"
            value={brushSize}
            onChange={(e) => onChangeSize(Number(e.target.value))}
            className="w-16 accent-cyan-400 cursor-pointer"
          />
          <span className="font-mono text-neutral-300 w-5">{brushSize}px</span>
        </div>
      </div>

      {/* Right: Actions, Video & Viewport Controls */}
      <div className="flex items-center gap-2">
        {/* Clear Canvas */}
        <button
          onClick={onClear}
          title="Clear canvas strokes (shortcut: C)"
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5 text-amber-400" />
          <span>Clear</span>
        </button>

        {/* Save PNG */}
        <button
          onClick={onSaveCanvas}
          title="Save creation as PNG"
          className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Toggle Air Keyboard */}
        <button
          onClick={onToggleKeyboard}
          className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
            showKeyboard
              ? 'bg-neutral-800 border-neutral-700 text-cyan-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Toggle on-screen gesture keyboard"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keyboard: {showKeyboard ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mouse Simulation Mode */}
        <button
          onClick={onToggleSimulated}
          className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
            isSimulated
              ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Enable mouse simulation mode (Click/Space to pinch, 1-7 keys for gestures)"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mouse Mode</span>
        </button>

        {/* Flip Mirror */}
        <button
          onClick={onToggleMirror}
          className={`px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isMirrored
              ? 'bg-neutral-800 border-neutral-700 text-cyan-300'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
          title="Flip video mirror horizontally"
        >
          Flip
        </button>

        {/* Camera Toggle */}
        <button
          onClick={onToggleWebcam}
          className={`px-3 py-1.5 rounded-lg font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
            isWebcamActive
              ? 'bg-red-950/50 hover:bg-red-900/50 text-red-200 border-red-800/80'
              : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 border-emerald-700/80'
          }`}
        >
          {isWebcamActive ? (
            <>
              <VideoOff className="w-3.5 h-3.5 text-red-400" />
              <span>Stop Cam</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Start Cam</span>
            </>
          )}
        </button>
      </div>
    </footer>
  );
};
