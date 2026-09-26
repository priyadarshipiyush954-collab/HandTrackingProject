import React, { useEffect, useRef, useCallback } from 'react';
import { WebHandDetector } from '../utils/handTracker';
import { getKeyBoxes, getHoverKey, drawKeyboardOnCanvas } from '../utils/keyboard';
import { playGestureSound, playKeyClick, playClearSound } from '../utils/audio';
import { VisualEffectsEngine } from '../utils/effectsEngine';
import { renderStrokeSegment } from '../utils/brushStyles';
import { BrushMode, HandData, HandGesture, KeyBox, LETTERS } from '../types/tracker';

interface HandCanvasBoardProps {
  brushMode: BrushMode;
  brushColor: string;
  brushSize: number;
  isWebcamActive: boolean;
  onWebcamStateChange: (active: boolean) => void;
  isSimulated: boolean;
  isMirrored: boolean;
  showKeyboard: boolean;
  soundEnabled: boolean;
  activeGesture: HandGesture;
  setActiveGesture: (g: HandGesture) => void;
  setHandDetected: (detected: boolean) => void;
  setFps: (fps: number) => void;
  command: string;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
}

export const HandCanvasBoard: React.FC<HandCanvasBoardProps> = ({
  brushMode,
  brushColor,
  brushSize,
  isWebcamActive,
  onWebcamStateChange,
  isSimulated,
  isMirrored,
  showKeyboard,
  soundEnabled,
  activeGesture,
  setActiveGesture,
  setHandDetected,
  setFps,
  command,
  setCommand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const detectorRef = useRef<WebHandDetector | null>(null);
  const effectsEngineRef = useRef<VisualEffectsEngine>(new VisualEffectsEngine());
  const animFrameIdRef = useRef<number | null>(null);

  // Drawing state
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);
  const trailPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const activeKeyIdxRef = useRef<number | null>(null);
  const prevGestureRef = useRef<HandGesture>('IDLE');

  // Mouse / Pointer fallback
  const mousePointRef = useRef<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const isSpaceDownRef = useRef<boolean>(false);
  const simulatedGestureRef = useRef<HandGesture>('IDLE');

  // FPS tracking
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // Initialize WebHandDetector once
  useEffect(() => {
    const detector = new WebHandDetector();
    detectorRef.current = detector;
    detector.initialize();
  }, []);

  // Initialize offscreen drawing canvas
  useEffect(() => {
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 1280;
    dCanvas.height = 720;
    drawingCanvasRef.current = dCanvas;
  }, []);

  // Sync simulated gesture from parent
  useEffect(() => {
    if (activeGesture !== 'IDLE' && isSimulated) {
      simulatedGestureRef.current = activeGesture;
    }
  }, [activeGesture, isSimulated]);

  // Webcam stream handlers
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        onWebcamStateChange(true);
      }
    } catch (err) {
      console.warn('Webcam permission not granted or device unavailable:', err);
      onWebcamStateChange(false);
    }
  }, [onWebcamStateChange]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    onWebcamStateChange(false);
  }, [onWebcamStateChange]);

  useEffect(() => {
    if (isWebcamActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isWebcamActive, startCamera, stopCamera]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'c' || e.key === 'C') {
        clearCanvas();
      } else if (e.key === ' ' || e.code === 'Space') {
        isSpaceDownRef.current = true;
      } else if (e.key === '1') {
        simulatedGestureRef.current = 'PINCH';
        setActiveGesture('PINCH');
      } else if (e.key === '2') {
        simulatedGestureRef.current = 'POINT';
        setActiveGesture('POINT');
      } else if (e.key === '3') {
        simulatedGestureRef.current = 'OPEN_PALM';
        setActiveGesture('OPEN_PALM');
      } else if (e.key === '4') {
        simulatedGestureRef.current = 'PEACE';
        setActiveGesture('PEACE');
      } else if (e.key === '5') {
        simulatedGestureRef.current = 'FIST';
        setActiveGesture('FIST');
      } else if (e.key === '6') {
        simulatedGestureRef.current = 'ROCK_ON';
        setActiveGesture('ROCK_ON');
      } else if (e.key === '7') {
        simulatedGestureRef.current = 'THUMBS_UP';
        setActiveGesture('THUMBS_UP');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        isSpaceDownRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setActiveGesture]);

  const clearCanvas = () => {
    const dCanvas = drawingCanvasRef.current;
    if (dCanvas) {
      const ctx = dCanvas.getContext('2d');
      ctx?.clearRect(0, 0, dCanvas.width, dCanvas.height);
    }
    effectsEngineRef.current.clear();
    setCommand('');
    if (soundEnabled) playClearSound();
  };

  // Main 60FPS animation & vision render loop
  useEffect(() => {
    let isLoopRunning = true;

    const renderLoop = () => {
      if (!isLoopRunning) return;

      const canvas = displayCanvasRef.current;
      const dCanvas = drawingCanvasRef.current;
      const video = videoRef.current;
      const ctx = canvas?.getContext('2d');
      const dCtx = dCanvas?.getContext('2d');

      if (!canvas || !ctx || !dCanvas || !dCtx) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Responsive viewport size
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;

        if (dCanvas.width < width || dCanvas.height < height) {
          const temp = document.createElement('canvas');
          temp.width = dCanvas.width;
          temp.height = dCanvas.height;
          temp.getContext('2d')?.drawImage(dCanvas, 0, 0);

          dCanvas.width = Math.max(dCanvas.width, width);
          dCanvas.height = Math.max(dCanvas.height, height);
          dCtx.drawImage(temp, 0, 0);
        }
      }

      const now = performance.now();

      // FPS Measurement
      frameCountRef.current++;
      if (now - lastFpsUpdateRef.current >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
        setFps(measuredFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      // 1. Render Dark Studio Backdrop
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Webcam feed if available
      if (video && isWebcamActive && video.readyState >= 2) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      }

      // 3. Hand Detection
      let primaryHand: HandData | null = null;

      if (isWebcamActive && video && video.readyState >= 2 && detectorRef.current?.isReady()) {
        const hands = detectorRef.current.detectHands(video, now, width, height);
        if (hands.length > 0) {
          primaryHand = hands[0];
          if (isMirrored) {
            primaryHand.indexTip.x = width - primaryHand.indexTip.x;
            primaryHand.thumbTip.x = width - primaryHand.thumbTip.x;
            primaryHand.palmCenter.x = width - primaryHand.palmCenter.x;
            primaryHand.landmarks.forEach((lm) => {
              lm.x = width - lm.x;
            });
          }
        }
      }

      // Simulation / Mouse fallback
      if (!primaryHand && isSimulated && mousePointRef.current) {
        const mx = mousePointRef.current.x;
        const my = mousePointRef.current.y;
        const isClick = isMouseDownRef.current || isSpaceDownRef.current;
        const currentSimGesture = isClick ? 'PINCH' : simulatedGestureRef.current;

        // Generate synthetic hand geometry for visualization
        const syntheticLandmarks = [];
        for (let i = 0; i < 21; i++) {
          syntheticLandmarks.push({ x: mx, y: my });
        }

        primaryHand = {
          landmarks: syntheticLandmarks,
          palmCenter: { x: mx, y: my + 30 },
          palmSize: 55,
          indexTip: { x: mx, y: my },
          thumbTip: { x: mx + (isClick ? 6 : 28), y: my + (isClick ? 6 : 28) },
          middleTip: { x: mx + 15, y: my - 15 },
          ringTip: { x: mx + 30, y: my - 10 },
          pinkyTip: { x: mx + 42, y: my - 5 },
          pinchDistance: isClick ? 12 : 55,
          isPinching: isClick,
          gesture: currentSimGesture,
          gestureConfidence: 0.98,
        };
      }

      // Keyboard bounding boxes (if enabled)
      const keyBoxes: KeyBox[] = showKeyboard ? getKeyBoxes(width, height) : [];
      let hoverKey: number | null = null;

      if (primaryHand) {
        setHandDetected(true);
        const currentGesture = primaryHand.gesture;
        setActiveGesture(currentGesture);

        // Sound trigger on gesture transition
        if (currentGesture !== prevGestureRef.current && currentGesture !== 'IDLE') {
          if (soundEnabled) {
            playGestureSound(currentGesture);
          }
          if (currentGesture === 'OPEN_PALM') {
            effectsEngineRef.current.triggerShockwave(
              primaryHand.palmCenter.x,
              primaryHand.palmCenter.y,
              '#10b981',
              280
            );
          } else if (currentGesture === 'THUMBS_UP') {
            effectsEngineRef.current.triggerShockwave(
              primaryHand.thumbTip.x,
              primaryHand.thumbTip.y,
              '#eab308',
              220
            );
          }
          prevGestureRef.current = currentGesture;
        }

        // Virtual keyboard interaction
        if (showKeyboard) {
          hoverKey = getHoverKey(primaryHand.indexTip, keyBoxes);

          // Tap key with pinch
          if (
            primaryHand.isPinching &&
            hoverKey !== null &&
            now - lastTriggerTimeRef.current > 320
          ) {
            const letter = LETTERS[hoverKey];
            activeKeyIdxRef.current = hoverKey;
            setTimeout(() => {
              activeKeyIdxRef.current = null;
            }, 140);

            if (soundEnabled) playKeyClick();

            setCommand((prev) => {
              const next = letter === '<' ? prev.slice(0, -1) : prev + (letter === '_' ? ' ' : letter);
              return next;
            });

            lastTriggerTimeRef.current = now;
          }
        }

        // Air-Drawing when PINCHING outside keyboard
        if (primaryHand.isPinching && hoverKey === null) {
          let lastDraw = lastDrawPointRef.current;
          let trailPoint = trailPointRef.current;

          const currentPoint = primaryHand.indexTip;

          if (!lastDraw) lastDraw = currentPoint;
          if (!trailPoint) trailPoint = currentPoint;

          const dist = Math.hypot(currentPoint.x - trailPoint.x, currentPoint.y - trailPoint.y);
          const steps = Math.max(2, Math.floor(dist / 5));

          for (let t = 1; t <= steps; t++) {
            const ix = trailPoint.x + ((currentPoint.x - trailPoint.x) * t) / steps;
            const iy = trailPoint.y + ((currentPoint.y - trailPoint.y) * t) / steps;

            renderStrokeSegment(
              dCtx,
              lastDraw,
              { x: ix, y: iy },
              brushMode,
              brushColor,
              brushSize
            );

            lastDraw = { x: ix, y: iy };
          }

          lastDrawPointRef.current = lastDraw;
          trailPointRef.current = currentPoint;
        } else {
          lastDrawPointRef.current = null;
          trailPointRef.current = null;
        }

        // Plasma Beam when POINTING
        if (primaryHand.gesture === 'POINT') {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          const angle = Math.atan2(
            primaryHand.indexTip.y - primaryHand.palmCenter.y,
            primaryHand.indexTip.x - primaryHand.palmCenter.x
          );
          ctx.moveTo(primaryHand.indexTip.x, primaryHand.indexTip.y);
          ctx.lineTo(
            primaryHand.indexTip.x + Math.cos(angle) * 160,
            primaryHand.indexTip.y + Math.sin(angle) * 160
          );
          ctx.stroke();
          ctx.restore();
        }
      } else {
        setHandDetected(false);
        setActiveGesture('IDLE');
        prevGestureRef.current = 'IDLE';
        lastDrawPointRef.current = null;
        trailPointRef.current = null;
      }

      // 4. Update Particle Physics Engine
      effectsEngineRef.current.update(width, height, primaryHand);

      // 5. Draw persistent user strokes
      ctx.drawImage(dCanvas, 0, 0);

      // 6. Render Particles, Holographic Auras, and Hand Skeleton
      effectsEngineRef.current.render(ctx, primaryHand);

      // 7. Render Virtual Keyboard (if toggled on)
      if (showKeyboard && keyBoxes.length > 0) {
        drawKeyboardOnCanvas(ctx, keyBoxes, hoverKey, activeKeyIdxRef.current);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isLoopRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    isWebcamActive,
    isSimulated,
    isMirrored,
    showKeyboard,
    soundEnabled,
    brushMode,
    brushColor,
    brushSize,
    setActiveGesture,
    setHandDetected,
    setFps,
    setCommand,
  ]);

  // Pointer event listeners for mouse simulation
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!displayCanvasRef.current) return;
    const rect = displayCanvasRef.current.getBoundingClientRect();
    mousePointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = () => {
    isMouseDownRef.current = true;
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  const handlePointerLeave = () => {
    isMouseDownRef.current = false;
    mousePointRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full h-full bg-neutral-950 overflow-hidden flex items-center justify-center cursor-crosshair select-none"
    >
      {/* Hidden Webcam Feed */}
      <video ref={videoRef} playsInline muted autoPlay className="hidden" />

      {/* Main Canvas Viewport */}
      <canvas
        ref={displayCanvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="w-full h-full block"
      />
    </div>
  );
};
