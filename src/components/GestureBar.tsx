import React from 'react';
import { GESTURE_DEFINITIONS, HandGesture } from '../types/tracker';

interface GestureBarProps {
  activeGesture: HandGesture;
  onSelectGesture: (gesture: HandGesture) => void;
  isSimulated: boolean;
}

export const GestureBar: React.FC<GestureBarProps> = ({
  activeGesture,
  onSelectGesture,
  isSimulated,
}) => {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 max-w-4xl w-[94%] pointer-events-none">
      <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 rounded-xl p-2 shadow-2xl pointer-events-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between px-2 pb-1.5 border-b border-neutral-800/60 mb-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide text-[11px] uppercase">
              Gesture Recognition Engine
            </span>
            <span className="text-neutral-500 text-[10px]">·</span>
            <span className="text-neutral-400 text-[11px]">
              {isSimulated ? 'Click any gesture below or use hand in webcam' : 'Perform gesture with your hand in front of camera'}
            </span>
          </div>

          <div className="text-[11px] text-neutral-400">
            Active: <span className="font-bold text-cyan-300 font-mono">{activeGesture.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Gesture Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {GESTURE_DEFINITIONS.map((def) => {
            const isActive = activeGesture === def.id;
            return (
              <button
                key={def.id}
                onClick={() => onSelectGesture(def.id)}
                className={`flex flex-col items-start text-left p-2 rounded-lg border transition-all cursor-pointer select-none ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                    : 'border-neutral-800/80 bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-neutral-700'
                }`}
                title={`${def.name}: ${def.description}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg leading-none">{def.symbol}</span>
                  {isActive && (
                    <span
                      className="w-2 h-2 rounded-full animate-ping"
                      style={{ backgroundColor: def.color }}
                    />
                  )}
                </div>

                <div className="mt-1 font-semibold text-xs text-white truncate w-full">
                  {def.name}
                </div>

                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {def.keyAction}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
