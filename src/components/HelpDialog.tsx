import React from 'react';
import { X, Sparkles, Wand2, Hand, MousePointer, Keyboard } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          Hand Tracking Anime Board Guide
        </h2>

        <div className="space-y-4 text-sm text-neutral-300">
          <div className="flex items-start gap-3 bg-neutral-800/60 p-3 rounded-lg border border-neutral-700/60">
            <Hand className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">1. Hand Tracking Gestures</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Show your hand to the camera. Bring your <strong>Thumb tip</strong> and <strong>Index finger tip</strong> close together to pinch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-neutral-800/60 p-3 rounded-lg border border-neutral-700/60">
            <Keyboard className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">2. Virtual Keyboard</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Hover your fingertip over any key on the bottom keyboard and pinch to type. Use <strong>_</strong> for Space and <strong>DEL</strong> to backspace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-neutral-800/60 p-3 rounded-lg border border-neutral-700/60">
            <Sparkles className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">3. Anime Special Effects</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Type <span className="font-bold text-red-400">BANKAI</span> to summon spiritual pressure aura rings with sub-bass audio impact.
                Type <span className="font-bold text-sky-400">SHADOW CLONE</span> to summon shinobi clone illusions and smoke effects!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-neutral-800/60 p-3 rounded-lg border border-neutral-700/60">
            <MousePointer className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white">4. Mouse / Touch Mode (No Camera)</h3>
              <p className="text-xs text-neutral-400 mt-1">
                No webcam? Toggle <strong>Mouse Mode</strong> in the bottom toolbar. Move the cursor, then <strong>Click</strong> or hold <strong>Spacebar</strong> to simulate pinching!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium rounded-lg text-sm transition-all cursor-pointer"
          >
            Got it, Let&apos;s Draw!
          </button>
        </div>
      </div>
    </div>
  );
};
