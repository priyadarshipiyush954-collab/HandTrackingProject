import { useState, useCallback } from 'react';
import { HeaderHUD } from './components/HeaderHUD';
import { Toolbar } from './components/Toolbar';
import { InstructionBanner } from './components/InstructionBanner';
import { HelpDialog } from './components/HelpDialog';
import { GestureBar } from './components/GestureBar';
import { HandCanvasBoard } from './components/HandCanvasBoard';
import { BrushMode, HandGesture } from './types/tracker';
import { playClearSound } from './utils/audio';

export function App() {
  const [activeGesture, setActiveGesture] = useState<HandGesture>('IDLE');
  const [brushMode, setBrushMode] = useState<BrushMode>('NEON');
  const [brushColor, setBrushColor] = useState<string>('#06b6d4');
  const [brushSize, setBrushSize] = useState<number>(8);

  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [command, setCommand] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleClear = useCallback(() => {
    const event = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
    window.dispatchEvent(event);
    setCommand('');
    if (soundEnabled) playClearSound();
  }, [soundEnabled]);

  const handleSaveCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `gesture-studio-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* Top Header HUD */}
      <HeaderHUD
        activeGesture={activeGesture}
        isWebcamActive={isWebcamActive}
        handDetected={handDetected}
        fps={fps}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onShowHelp={() => setShowHelp(true)}
        onSelectGesture={setActiveGesture}
      />

      {/* Main Vision Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        <InstructionBanner onShowHelp={() => setShowHelp(true)} />

        <HandCanvasBoard
          brushMode={brushMode}
          brushColor={brushColor}
          brushSize={brushSize}
          isWebcamActive={isWebcamActive}
          onWebcamStateChange={setIsWebcamActive}
          isSimulated={isSimulated}
          isMirrored={isMirrored}
          showKeyboard={showKeyboard}
          soundEnabled={soundEnabled}
          activeGesture={activeGesture}
          setActiveGesture={setActiveGesture}
          setHandDetected={setHandDetected}
          setFps={setFps}
          command={command}
          setCommand={setCommand}
        />

        {/* Floating Gesture Selector Bar */}
        <GestureBar
          activeGesture={activeGesture}
          onSelectGesture={setActiveGesture}
          isSimulated={isSimulated}
        />
      </main>

      {/* Bottom Controls Toolbar */}
      <Toolbar
        brushMode={brushMode}
        onChangeBrushMode={setBrushMode}
        brushColor={brushColor}
        onChangeColor={setBrushColor}
        brushSize={brushSize}
        onChangeSize={setBrushSize}
        isWebcamActive={isWebcamActive}
        onToggleWebcam={() => setIsWebcamActive((prev) => !prev)}
        isSimulated={isSimulated}
        onToggleSimulated={() => setIsSimulated((prev) => !prev)}
        showKeyboard={showKeyboard}
        onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored((prev) => !prev)}
        onClear={handleClear}
        onSaveCanvas={handleSaveCanvas}
      />

      {/* Comprehensive Guide Modal */}
      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;
