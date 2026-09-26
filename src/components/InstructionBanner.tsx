import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface InstructionBannerProps {
  onShowHelp: () => void;
}

export const InstructionBanner: React.FC<InstructionBannerProps> = ({ onShowHelp }) => {
  return (
    <div className="absolute top-3 left-4 z-20 pointer-events-none max-w-lg">
      <div className="bg-neutral-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-neutral-800/80 shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Show your hand to the camera to trigger real-time actions</span>
          </div>
          <button
            onClick={onShowHelp}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Open Gesture Guide"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
          <span>👌 <strong className="text-cyan-300">Pinch:</strong> Air Draw</span>
          <span className="text-neutral-600">·</span>
          <span>✌️ <strong className="text-pink-300">Peace:</strong> Sakura Domain</span>
          <span className="text-neutral-600">·</span>
          <span>✊ <strong className="text-red-300">Fist:</strong> Bankai Vortex</span>
          <span className="text-neutral-600">·</span>
          <span>🤘 <strong className="text-amber-300">Rock:</strong> Fire Dragon</span>
        </div>
      </div>
    </div>
  );
};
