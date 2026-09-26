import React from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { GESTURE_DEFINITIONS } from '../types/tracker';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">
            Hand Gesture &amp; Vision Studio Guide
          </h2>
        </div>
        <p className="text-xs text-neutral-400 mb-5">
          Perform natural hand poses in front of your camera. MediaPipe vision algorithms detect your 21-joint skeleton and trigger instant interactive effects.
        </p>

        {/* Gestures List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {GESTURE_DEFINITIONS.map((def) => (
            <div
              key={def.id}
              className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800 flex items-start gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border"
                style={{ backgroundColor: `${def.color}15`, borderColor: `${def.color}40` }}
              >
                {def.symbol}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{def.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400">({def.keyAction})</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">{def.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accuracy & Lighting Tips */}
        <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 mb-6 text-xs text-neutral-300">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tips for Maximum Hand Tracking Accuracy
          </h4>
          <ul className="space-y-1.5 text-neutral-400 pl-5 list-disc">
            <li>Ensure decent lighting on your hand so fingers and palm stand out against the background.</li>
            <li>Keep your hand inside the webcam frame around 1.5 to 3 feet from the lens.</li>
            <li>Our adaptive dual-mode filter automatically dampens camera jitter while providing zero-latency flick response.</li>
            <li>No webcam? Turn on <strong>Mouse Mode</strong> in the bottom toolbar. You can click or hold Spacebar to pinch, and tap keys 1–7 to simulate any gesture!</li>
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">C</kbd> to clear · <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">ESC</kbd> to close</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all cursor-pointer"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
