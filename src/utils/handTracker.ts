import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandData, Landmark } from '../types/tracker';
import { GestureClassifier } from './gestureRecognizer';

export class WebHandDetector {
  private landmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private initError: string | null = null;
  private classifier: GestureClassifier = new GestureClassifier();

  // Velocity-adaptive smoothing filters per landmark
  private prevSmoothedPoints: { [key: number]: { x: number; y: number } } = {};

  public async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.isInitializing) return false;
    this.isInitializing = true;
    this.initError = null;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Check if local task asset exists
      let modelAssetPath = '/hand_landmarker.task';
      try {
        const testRes = await fetch(modelAssetPath, { method: 'HEAD' });
        if (!testRes.ok) {
          modelAssetPath =
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
        }
      } catch {
        modelAssetPath =
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
      }

      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
      });

      this.isInitializing = false;
      return true;
    } catch (err: unknown) {
      console.warn('GPU initialization failed, falling back to CPU delegate...', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
        this.isInitializing = false;
        return true;
      } catch (fallbackErr: unknown) {
        this.initError =
          fallbackErr instanceof Error ? fallbackErr.message : 'Failed to initialize HandLandmarker';
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
        this.classifier.reset();
        return [];
      }

      return results.landmarks.map((rawLms, handIdx) => {
        // Convert to target canvas space with velocity-adaptive smoothing
        const smoothedLandmarks: Landmark[] = rawLms.map((lm, ptIdx) => {
          const rawX = lm.x * targetWidth;
          const rawY = lm.y * targetHeight;

          const key = handIdx * 100 + ptIdx;
          const prev = this.prevSmoothedPoints[key];

          if (!prev) {
            this.prevSmoothedPoints[key] = { x: rawX, y: rawY };
            return { x: rawX, y: rawY, z: lm.z };
          }

          // Velocity: Euclidean distance delta
          const distDelta = Math.hypot(rawX - prev.x, rawY - prev.y);

          // Adaptive Alpha:
          // Low velocity (< 3px) -> alpha = 0.22 (high dampening, rock-solid tremor cancellation)
          // High velocity (> 25px) -> alpha = 0.85 (immediate response, zero lag)
          const velocityNorm = Math.min(1.0, Math.max(0, (distDelta - 3) / 22));
          const alpha = 0.22 + velocityNorm * 0.63;

          const smoothX = prev.x + alpha * (rawX - prev.x);
          const smoothY = prev.y + alpha * (rawY - prev.y);

          this.prevSmoothedPoints[key] = { x: smoothX, y: smoothY };
          return { x: smoothX, y: smoothY, z: lm.z };
        });

        // Key points
        const wrist = smoothedLandmarks[0];
        const thumbTip = smoothedLandmarks[4];
        const indexTip = smoothedLandmarks[8];
        const middleMcp = smoothedLandmarks[9];
        const middleTip = smoothedLandmarks[12];
        const ringTip = smoothedLandmarks[16];
        const pinkyTip = smoothedLandmarks[20];

        // Palm center (average of wrist & knuckle base joints)
        const palmCenterX = (wrist.x + smoothedLandmarks[5].x + middleMcp.x + smoothedLandmarks[17].x) / 4;
        const palmCenterY = (wrist.y + smoothedLandmarks[5].y + middleMcp.y + smoothedLandmarks[17].y) / 4;
        const palmSize = Math.max(20, Math.hypot(wrist.x - middleMcp.x, wrist.y - middleMcp.y));

        // Scale-invariant gesture detection
        const { gesture, confidence, pinchDistance, isPinching } =
          this.classifier.classify(smoothedLandmarks);

        return {
          landmarks: smoothedLandmarks,
          palmCenter: { x: palmCenterX, y: palmCenterY },
          palmSize,
          indexTip: { x: indexTip.x, y: indexTip.y },
          thumbTip: { x: thumbTip.x, y: thumbTip.y },
          middleTip: { x: middleTip.x, y: middleTip.y },
          ringTip: { x: ringTip.x, y: ringTip.y },
          pinkyTip: { x: pinkyTip.x, y: pinkyTip.y },
          pinchDistance,
          isPinching,
          gesture,
          gestureConfidence: confidence,
        };
      });
    } catch {
      return [];
    }
  }

  public resetFilters() {
    this.prevSmoothedPoints = {};
    this.classifier.reset();
  }
}
