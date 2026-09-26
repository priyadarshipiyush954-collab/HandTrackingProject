import { useState, useCallback, useRef } from 'react';
import { HeaderHUD } from './components/HeaderHUD';
import { Toolbar } from './components/Toolbar';
import { InstructionBanner } from './components/InstructionBanner';
import { HelpDialog } from './components/HelpDialog';
import { HandCanvasBoard } from './components/HandCanvasBoard';
import { AnimeEffectInstance } from './types/tracker';
import { playClearSound } from './utils/audio';

export function App() {
  const [command, setCommand] = useState<string>('');
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(true); // Enabled by default for instant interaction
  const [webcamOpacity, setWebcamOpacity] = useState<number>(0.75);
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Status HUD state
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);
  const [pinchDistance, setPinchDistance] = useState<number>(0);
  const [isPinching, setIsPinching] = useState<boolean>(false);

  // Dialogs & manual triggers
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [manualTriggerEffect, setManualTriggerEffect] = useState<AnimeEffectInstance | null>(null);

  const demoTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  const handleClear = useCallback(() => {
    // Dispatch clear key event or trigger via custom event
    const event = new KeyboardEvent('keydown', { key: 'c', bubbles: true });
    window.dispatchEvent(event);
    setCommand('');
    if (soundEnabled) playClearSound();
  }, [soundEnabled]);

  const handleTriggerBankai = useCallback(() => {
    setManualTriggerEffect({
      name: 'BANKAI',
      duration: 2.6,
      startedAt: performance.now(),
    });
  }, []);

  const handleTriggerShadowClone = useCallback(() => {
    setManualTriggerEffect({
      name: 'SHADOW CLONE',
      duration: 2.6,
      startedAt: performance.now(),
    });
  }, []);

  const handleSaveCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `anime-board-drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Automated demo simulation to demonstrate typing BANKAI and triggering effect
  const handleRunDemoScript = useCallback(() => {
    // Clear any previous scheduled timeouts
    demoTimeoutRef.current.forEach(clearTimeout);
    demoTimeoutRef.current = [];

    setCommand('');
    const targetWord = 'BANKAI';
    let current = '';

    targetWord.split('').forEach((letter, idx) => {
      const t = setTimeout(() => {
        current += letter;
        setCommand(current);
        if (idx === targetWord.length - 1) {
          setTimeout(() => {
            handleTriggerBankai();
            setCommand('');
          }, 350);
        }
      }, (idx + 1) * 350);
      demoTimeoutRef.current.push(t);
    });
  }, [handleTriggerBankai]);

  return (
    <div className="flex flex-col w-screen h-screen bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      {/* Top HUD Header */}
      <HeaderHUD
        command={command}
        isWebcamActive={isWebcamActive}
        handDetected={handDetected}
        fps={fps}
        pinchDistance={pinchDistance}
        isPinching={isPinching}
        isSimulated={isSimulated}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onClear={handleClear}
        onTriggerBankai={handleTriggerBankai}
        onTriggerShadowClone={handleTriggerShadowClone}
        onSaveCanvas={handleSaveCanvas}
      />

      {/* Main Board Viewport with HUD overlay */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex flex-col">
        <InstructionBanner onShowHelp={() => setShowHelp(true)} />

        <HandCanvasBoard
          brushColor={brushColor}
          brushSize={brushSize}
          isWebcamActive={isWebcamActive}
          onWebcamStateChange={setIsWebcamActive}
          isSimulated={isSimulated}
          webcamOpacity={webcamOpacity}
          isMirrored={isMirrored}
          soundEnabled={soundEnabled}
          command={command}
          setCommand={setCommand}
          setHandDetected={setHandDetected}
          setFps={setFps}
          setPinchDistance={setPinchDistance}
          setIsPinching={setIsPinching}
          manualTriggerEffect={manualTriggerEffect}
          onClearEffect={() => setManualTriggerEffect(null)}
        />
      </main>

      {/* Bottom Controls Toolbar */}
      <Toolbar
        brushColor={brushColor}
        onChangeColor={setBrushColor}
        brushSize={brushSize}
        onChangeSize={setBrushSize}
        isWebcamActive={isWebcamActive}
        onToggleWebcam={() => setIsWebcamActive((prev) => !prev)}
        isSimulated={isSimulated}
        onToggleSimulated={() => setIsSimulated((prev) => !prev)}
        webcamOpacity={webcamOpacity}
        onChangeWebcamOpacity={setWebcamOpacity}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored((prev) => !prev)}
        onRunDemoScript={handleRunDemoScript}
      />

      {/* Help Modal */}
      <HelpDialog isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default App;
