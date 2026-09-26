import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandData, Landmark } from '../types/tracker';

export class WebHandDetector {
  private landmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;

  public async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.isInitializing) return false;
    this.isInitializing = true;
    this.initError = null;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Try local task file first, fallback to googleapis CDN if needed
      let modelAssetPath = '/hand_landmarker.task';
      try {
        const testRes = await fetch(modelAssetPath, { method: 'HEAD' });
        if (!testRes.ok) {
          modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        }
      } catch {
        modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
      }

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      this.isInitializing = false;
      return true;
    } catch (err: unknown) {
      console.warn('GPU delegate failed or error loading model, trying CPU fallback...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        this.isInitializing = false;
        return true;
      } catch (fallbackErr: unknown) {
        this.initError = fallbackErr instanceof Error ? fallbackErr.message : 'Failed to initialize HandLandmarker';
        this.isInitializing = false;
        console.error('HandLandmarker init error:', fallbackErr);
        return false;
      }
    }
  }

  public isReady(): boolean {
    return this.landmarker !== null;
  }

  public getError(): string | null {
    return this.initError;
  }

  public detectHands(
    videoElement: HTMLVideoElement,
    timestampMs: number,
    targetWidth: number,
    targetHeight: number
  ): HandData[] {
    if (!this.landmarker) return [];

    try {
      const results = this.landmarker.detectForVideo(videoElement, timestampMs);
      if (!results || !results.landmarks || results.landmarks.length === 0) {
        return [];
      }

      return results.landmarks.map((handLandmarks) => {
        // Pixel coordinates scaled to target canvas
        const pixelLandmarks: Landmark[] = handLandmarks.map((lm) => ({
          x: lm.x * targetWidth,
          y: lm.y * targetHeight,
          z: lm.z,
        }));

        // Hand landmarks:
        // 4 is Thumb Tip, 8 is Index Finger Tip
        const thumbTip = pixelLandmarks[4] || { x: 0, y: 0 };
        const indexTip = pixelLandmarks[8] || { x: 0, y: 0 };

        const pinchDistance = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const isPinching = pinchDistance < 42;

        return {
          landmarks: pixelLandmarks,
          indexTip: { x: indexTip.x, y: indexTip.y },
          thumbTip: { x: thumbTip.x, y: thumbTip.y },
          pinchDistance,
          isPinching,
        };
      });
    } catch {
      return [];
    }
  }

  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    handData: HandData,
    _width: number,
    _height: number
  ) {
    const lms = handData.landmarks;
    if (lms.length < 21) return;

    // Connections between joints
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [9, 13], [13, 14], [14, 15], [15, 16],// Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                               // Wrist base
    ];

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.65)'; // Green glow lines like MediaPipe

    for (const [start, end] of connections) {
      const p1 = lms[start];
      const p2 = lms[end];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Draw landmark joints
    for (let i = 0; i < lms.length; i++) {
      const pt = lms[i];
      ctx.beginPath();
      if (i === 4 || i === 8) {
        // Thumb and Index tip highlighted
        ctx.fillStyle = handData.isPinching ? '#ef4444' : '#00dcff';
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Connect thumb tip and index tip with a gauge line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = handData.isPinching ? '#ef4444' : 'rgba(255, 255, 255, 0.7)';
    ctx.moveTo(handData.thumbTip.x, handData.thumbTip.y);
    ctx.lineTo(handData.indexTip.x, handData.indexTip.y);
    ctx.stroke();

    ctx.restore();
  }
}
