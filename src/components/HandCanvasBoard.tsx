import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WebHandDetector } from '../utils/handTracker';
import { getKeyBoxes, getHoverKey, drawKeyboardOnCanvas } from '../utils/keyboard';
import { drawAnimeEffect, createEffectParticles } from '../utils/animeRenderer';
import { playKeyClick, playBankaiSound, playShadowCloneSound, playClearSound } from '../utils/audio';
import { AnimeEffectInstance, HandData, KeyBox, LETTERS } from '../types/tracker';
import confetti from 'canvas-confetti';

interface HandCanvasBoardProps {
  brushColor: string;
  brushSize: number;
  isWebcamActive: boolean;
  onWebcamStateChange: (active: boolean) => void;
  isSimulated: boolean;
  webcamOpacity: number;
  isMirrored: boolean;
  soundEnabled: boolean;
  command: string;
  setCommand: React.Dispatch<React.SetStateAction<string>>;
  setHandDetected: (detected: boolean) => void;
  setFps: (fps: number) => void;
  setPinchDistance: (dist: number) => void;
  setIsPinching: (pinching: boolean) => void;
  manualTriggerEffect: AnimeEffectInstance | null;
  onClearEffect: () => void;
}

export const HandCanvasBoard: React.FC<HandCanvasBoardProps> = ({
  brushColor,
  brushSize,
  isWebcamActive,
  onWebcamStateChange,
  isSimulated,
  webcamOpacity,
  isMirrored,
  soundEnabled,
  command,
  setCommand,
  setHandDetected,
  setFps,
  setPinchDistance,
  setIsPinching,
  manualTriggerEffect,
  onClearEffect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const detectorRef = useRef<WebHandDetector | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Tracking state refs for 60fps loop without state tearing
  const cursorHistoryRef = useRef<{ x: number; y: number }[]>([]);
  const smoothPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);
  const trailPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const activeEffectRef = useRef<AnimeEffectInstance | null>(null);
  const activeKeyIdxRef = useRef<number | null>(null);

  // Mouse / Pointer fallback state
  const mousePointRef = useRef<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef<boolean>(false);
  const isSpaceDownRef = useRef<boolean>(false);

  // Demo automated animation state
  const demoRunningRef = useRef<boolean>(false);

  // FPS calculations
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(performance.now());

  // Handle manual trigger from HUD
  useEffect(() => {
    if (manualTriggerEffect) {
      activeEffectRef.current = {
        ...manualTriggerEffect,
        particles: createEffectParticles(
          manualTriggerEffect.name,
          displayCanvasRef.current?.width || 800,
          displayCanvasRef.current?.height || 600
        ),
      };
      if (soundEnabled) {
        if (manualTriggerEffect.name === 'BANKAI') playBankaiSound();
        else playShadowCloneSound();
      }
      onClearEffect();
    }
  }, [manualTriggerEffect, soundEnabled, onClearEffect]);

  // Initialize WebHandDetector once
  useEffect(() => {
    const detector = new WebHandDetector();
    detectorRef.current = detector;
    detector.initialize();
  }, []);

  // Initialize persistent drawing canvas
  useEffect(() => {
    const dCanvas = document.createElement('canvas');
    dCanvas.width = 1280;
    dCanvas.height = 720;
    const ctx = dCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.clearRect(0, 0, dCanvas.width, dCanvas.height);
    }
    drawingCanvasRef.current = dCanvas;
  }, []);

  // Setup webcam stream
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
      console.warn('Webcam access was denied or not available:', err);
      onWebcamStateChange(false);
    }
  }, [onWebcamStateChange]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
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

  // Keyboard shortcut listener ('c' to clear, 'b' for bankai, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'c' || e.key === 'C') {
        const dCanvas = drawingCanvasRef.current;
        if (dCanvas) {
          const ctx = dCanvas.getContext('2d');
          ctx?.clearRect(0, 0, dCanvas.width, dCanvas.height);
        }
        setCommand('');
        activeEffectRef.current = null;
        if (soundEnabled) playClearSound();
      } else if (e.key === ' ' || e.code === 'Space') {
        isSpaceDownRef.current = true;
      } else if (e.key === 'b' || e.key === 'B') {
        triggerEffectNamed('BANKAI');
      } else if (e.key === 's' || e.key === 'S') {
        triggerEffectNamed('SHADOW CLONE');
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
  }, [soundEnabled, setCommand]);

  const triggerEffectNamed = (name: 'BANKAI' | 'SHADOW CLONE') => {
    activeEffectRef.current = {
      name,
      duration: 2.6,
      startedAt: performance.now(),
      particles: createEffectParticles(
        name,
        displayCanvasRef.current?.width || 800,
        displayCanvasRef.current?.height || 600
      ),
    };
    if (soundEnabled) {
      if (name === 'BANKAI') playBankaiSound();
      else playShadowCloneSound();
    }
    if (name === 'BANKAI') {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626', '#111827'],
      });
    }
    setCommand('');
  };

  // Main Render & Detection Animation Loop (matches Python OpenCV run() function)
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

      // Resize canvas to match display size
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        if (dCanvas.width < width || dCanvas.height < height) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = dCanvas.width;
          tempCanvas.height = dCanvas.height;
          tempCanvas.getContext('2d')?.drawImage(dCanvas, 0, 0);

          dCanvas.width = Math.max(dCanvas.width, width);
          dCanvas.height = Math.max(dCanvas.height, height);
          dCtx.drawImage(tempCanvas, 0, 0);
        }
      }

      const now = performance.now();

      // FPS tracking
      frameCountRef.current++;
      if (now - lastFpsUpdateRef.current >= 500) {
        const measuredFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
        setFps(measuredFps);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      lastFrameTimeRef.current = now;

      // 1. Clear display frame
      ctx.fillStyle = '#0f0f13';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw webcam video feed if available (addWeighted frame logic from OpenCV)
      if (video && isWebcamActive && video.readyState >= 2) {
        ctx.save();
        ctx.globalAlpha = webcamOpacity;
        if (isMirrored) {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      }

      // 3. Process Hand Tracking or Mouse Simulation
      let primaryHand: HandData | null = null;

      if (isWebcamActive && video && video.readyState >= 2 && detectorRef.current?.isReady()) {
        const hands = detectorRef.current.detectHands(video, now, width, height);
        if (hands.length > 0) {
          primaryHand = hands[0];
          // Mirror x coordinates if display is mirrored
          if (isMirrored) {
            primaryHand.indexTip.x = width - primaryHand.indexTip.x;
            primaryHand.thumbTip.x = width - primaryHand.thumbTip.x;
            primaryHand.landmarks.forEach((lm) => {
              lm.x = width - lm.x;
            });
          }
        }
      }

      // If simulated / mouse mode is active or no hand detected from camera
      if (!primaryHand && isSimulated && mousePointRef.current) {
        const mx = mousePointRef.current.x;
        const my = mousePointRef.current.y;
        const isClickOrSpace = isMouseDownRef.current || isSpaceDownRef.current;
        const pinchDist = isClickOrSpace ? 15 : 65;

        primaryHand = {
          landmarks: [],
          indexTip: { x: mx, y: my },
          thumbTip: { x: mx + (isClickOrSpace ? 8 : 45), y: my + (isClickOrSpace ? 8 : 45) },
          pinchDistance: pinchDist,
          isPinching: isClickOrSpace,
        };
      }

      // Keyboard bounding boxes
      const keyBoxes: KeyBox[] = getKeyBoxes(width, height);
      let hoverKey: number | null = null;
      let smoothPoint = smoothPointRef.current;

      if (primaryHand) {
        setHandDetected(true);
        setPinchDistance(primaryHand.pinchDistance);
        setIsPinching(primaryHand.isPinching);

        // Moving-average cursor smoothing (deque size 7) + EMA (alpha 0.35) from main.py
        const history = cursorHistoryRef.current;
        history.push({ x: primaryHand.indexTip.x, y: primaryHand.indexTip.y });
        if (history.length > 7) {
          history.shift();
        }

        const avgX = history.reduce((sum, p) => sum + p.x, 0) / history.length;
        const avgY = history.reduce((sum, p) => sum + p.y, 0) / history.length;

        const emaAlpha = 0.35;
        if (!smoothPoint) {
          smoothPoint = { x: Math.round(avgX), y: Math.round(avgY) };
        } else {
          smoothPoint = {
            x: Math.round((1 - emaAlpha) * smoothPoint.x + emaAlpha * avgX),
            y: Math.round((1 - emaAlpha) * smoothPoint.y + emaAlpha * avgY),
          };
        }
        smoothPointRef.current = smoothPoint;

        // Check hover over virtual keyboard
        hoverKey = getHoverKey(smoothPoint, keyBoxes);

        // Draw hand landmarks if detected
        if (detectorRef.current && primaryHand.landmarks.length > 0) {
          detectorRef.current.drawLandmarks(ctx, primaryHand, width, height);
        }

        // Check PINCH interactions (from main.py)
        // 1) Pinch < 38 on keyboard -> type letter
        const pinch = primaryHand.pinchDistance;
        if (pinch < 38 && hoverKey !== null && (now - lastTriggerTimeRef.current > 350)) {
          const keyVal = LETTERS[hoverKey];
          activeKeyIdxRef.current = hoverKey;
          setTimeout(() => {
            activeKeyIdxRef.current = null;
          }, 150);

          if (soundEnabled) playKeyClick();

          setCommand((prev) => {
            const next = keyVal === '<' ? prev.slice(0, -1) : prev + (keyVal === '_' ? ' ' : keyVal);
            const upper = next.trim().toUpperCase();
            if (upper === 'BANKAI' || upper === 'SHADOW CLONE') {
              triggerEffectNamed(upper as 'BANKAI' | 'SHADOW CLONE');
              return '';
            }
            return next;
          });

          lastTriggerTimeRef.current = now;
        }

        // 2) Pinch < 28 away from keyboard -> Air Drawing with interpolation
        if (pinch < 32 && hoverKey === null) {
          let lastDraw = lastDrawPointRef.current;
          let trailPoint = trailPointRef.current;

          if (!lastDraw) lastDraw = smoothPoint;
          if (!trailPoint) trailPoint = smoothPoint;

          const dist = Math.hypot(smoothPoint.x - trailPoint.x, smoothPoint.y - trailPoint.y);
          const interpSteps = Math.max(2, Math.floor(dist / 6));

          dCtx.save();
          dCtx.strokeStyle = brushColor;
          dCtx.lineWidth = brushSize;
          dCtx.lineCap = 'round';
          dCtx.lineJoin = 'round';

          for (let t = 1; t <= interpSteps; t++) {
            const x = trailPoint.x + ((smoothPoint.x - trailPoint.x) * t) / interpSteps;
            const y = trailPoint.y + ((smoothPoint.y - trailPoint.y) * t) / interpSteps;

            dCtx.beginPath();
            dCtx.moveTo(lastDraw.x, lastDraw.y);
            dCtx.lineTo(x, y);
            dCtx.stroke();

            lastDraw = { x, y };
          }
          dCtx.restore();

          lastDrawPointRef.current = lastDraw;
          trailPointRef.current = smoothPoint;
        } else {
          lastDrawPointRef.current = null;
          trailPointRef.current = null;
        }
      } else {
        setHandDetected(false);
        setIsPinching(false);
        smoothPointRef.current = null;
        cursorHistoryRef.current = [];
        lastDrawPointRef.current = null;
        trailPointRef.current = null;
      }

      // 4. Blend drawings onto display frame
      ctx.drawImage(dCanvas, 0, 0);

      // 5. Draw Virtual Keyboard
      drawKeyboardOnCanvas(ctx, keyBoxes, hoverKey, activeKeyIdxRef.current);

      // 6. Draw smoothed hand cursor
      if (smoothPoint) {
        ctx.save();
        ctx.beginPath();
        const cursorPinching = primaryHand?.isPinching || false;
        ctx.fillStyle = cursorPinching ? '#ef4444' : '#22c55e';
        ctx.shadowColor = cursorPinching ? '#ef4444' : '#22c55e';
        ctx.shadowBlur = 12;
        ctx.arc(smoothPoint.x, smoothPoint.y, cursorPinching ? 10 : 7, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing ring around cursor
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = cursorPinching ? '#ffffff' : 'rgba(34, 197, 94, 0.7)';
        ctx.arc(smoothPoint.x, smoothPoint.y, cursorPinching ? 16 : 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      // 7. Render Active Anime Effect (BANKAI / SHADOW CLONE)
      const activeEffect = activeEffectRef.current;
      if (activeEffect) {
        drawAnimeEffect(ctx, activeEffect, width, height, now);
        const elapsed = (now - activeEffect.startedAt) / 1000;
        if (elapsed > activeEffect.duration) {
          activeEffectRef.current = null;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isLoopRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isWebcamActive,
    isSimulated,
    webcamOpacity,
    isMirrored,
    brushColor,
    brushSize,
    soundEnabled,
    setCommand,
    setHandDetected,
    setFps,
    setPinchDistance,
    setIsPinching,
  ]);

  // Mouse & Touch interaction handlers for pointer simulation
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
      className="relative flex-1 w-full h-full min-h-[450px] bg-neutral-950 overflow-hidden flex items-center justify-center cursor-crosshair select-none"
    >
      {/* Hidden Webcam Video Source */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
      />

      {/* Main Interactive Canvas */}
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
