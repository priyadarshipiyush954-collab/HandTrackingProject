import React from 'react';
import { Info } from 'lucide-react';

interface InstructionBannerProps {
  onShowHelp: () => void;
}

export const InstructionBanner: React.FC<InstructionBannerProps> = ({ onShowHelp }) => {
  return (
    <div className="absolute top-3 left-4 z-20 pointer-events-none flex flex-col gap-1 max-w-xl">
      <div className="bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-neutral-700/80 shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="text-neutral-200 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-white">Air Draw:</span> pinch away from keyboard | <span className="font-semibold text-white">Type:</span> pinch a key
          </div>
          <button
            onClick={onShowHelp}
            className="text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer pointer-events-auto"
            title="Help & Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[11px] font-mono text-neutral-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>Trigger words: <strong className="text-red-400 font-bold">BANKAI</strong>, <strong className="text-sky-400 font-bold">SHADOW CLONE</strong></span>
          <span>• <kbd className="px-1 py-0.2 bg-neutral-800 rounded border border-neutral-600 text-neutral-300">C</kbd> = clear</span>
          <span>• Pinch = Thumb &amp; Index Tip</span>
        </div>
      </div>
    </div>
  );
};
