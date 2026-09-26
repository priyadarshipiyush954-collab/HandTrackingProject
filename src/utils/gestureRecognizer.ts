import { HandGesture, Landmark } from '../types/tracker';

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export interface GestureDetectionResult {
  gesture: HandGesture;
  confidence: number;
  fingerStates: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
  pinchDistance: number;
  isPinching: boolean;
  palmSpan: number;
}

export class GestureClassifier {
  private history: HandGesture[] = [];
  private readonly historyLimit = 4;
  private currentStableGesture: HandGesture = 'IDLE';

  public classify(landmarks: Landmark[]): GestureDetectionResult {
    if (landmarks.length < 21) {
      return {
        gesture: 'IDLE',
        confidence: 0,
        fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        pinchDistance: 999,
        isPinching: false,
        palmSpan: 100,
      };
    }

    const wrist = landmarks[0];
    const thumbCmc = landmarks[1];
    const thumbMcp = landmarks[2];
    const thumbIp = landmarks[3];
    const thumbTip = landmarks[4];

    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexTip = landmarks[8];

    const middleMcp = landmarks[9];
    const middlePip = landmarks[10];
    const middleTip = landmarks[12];

    const ringMcp = landmarks[13];
    const ringPip = landmarks[14];
    const ringTip = landmarks[16];

    const pinkyMcp = landmarks[17];
    const pinkyPip = landmarks[18];
    const pinkyTip = landmarks[20];

    // Scale normalization using Palm Span (Wrist to Middle MCP)
    const palmSpan = Math.max(20, dist(wrist, middleMcp));

    // Measure distance from tip to wrist vs pip to wrist
    const indexDist = dist(indexTip, wrist);
    const indexPipDist = dist(indexPip, wrist);
    const middleDist = dist(middleTip, wrist);
    const middlePipDist = dist(middlePip, wrist);
    const ringDist = dist(ringTip, wrist);
    const ringPipDist = dist(ringPip, wrist);
    const pinkyDist = dist(pinkyTip, wrist);
    const pinkyPipDist = dist(pinkyPip, wrist);

    // Finger extended boolean checks
    const indexExtended = indexDist > indexPipDist * 1.18 && dist(indexTip, indexMcp) > palmSpan * 0.6;
    const middleExtended = middleDist > middlePipDist * 1.18 && dist(middleTip, middleMcp) > palmSpan * 0.6;
    const ringExtended = ringDist > ringPipDist * 1.18 && dist(ringTip, ringMcp) > palmSpan * 0.55;
    const pinkyExtended = pinkyDist > pinkyPipDist * 1.18 && dist(pinkyTip, pinkyMcp) > palmSpan * 0.5;

    // Thumb extension relative to pinky MCP and thumb MCP
    const thumbOpenDist = dist(thumbTip, pinkyMcp);
    const thumbExtended = thumbOpenDist > palmSpan * 0.85 && dist(thumbTip, thumbMcp) > palmSpan * 0.5;

    // Pinch distance between index tip and thumb tip
    const rawPinch = dist(indexTip, thumbTip);
    const pinchRatio = rawPinch / palmSpan;
    const isPinching = pinchRatio < 0.32;

    let candidate: HandGesture = 'IDLE';
    let confidence = 0.8;

    // 1. PINCH (High priority for drawing and UI interaction)
    if (isPinching) {
      candidate = 'PINCH';
      confidence = Math.max(0.7, 1 - pinchRatio / 0.32);
    }
    // 2. THUMBS UP (Thumb extended upwards, other 4 fingers curled)
    else if (
      !indexExtended &&
      !middleExtended &&
      !ringExtended &&
      !pinkyExtended &&
      thumbTip.y < thumbIp.y &&
      thumbTip.y < thumbMcp.y - palmSpan * 0.15 &&
      dist(thumbTip, wrist) > palmSpan * 0.65
    ) {
      candidate = 'THUMBS_UP';
      confidence = 0.95;
    }
    // 3. FIST (All 4 fingers curled, thumb tucked)
    else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      candidate = 'FIST';
      confidence = 0.9;
    }
    // 4. ROCK ON (Index & Pinky extended, Middle & Ring curled)
    else if (indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
      candidate = 'ROCK_ON';
      confidence = 0.92;
    }
    // 5. PEACE / VICTORY (Index & Middle extended, Ring & Pinky curled)
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      candidate = 'PEACE';
      confidence = 0.9;
    }
    // 6. POINT (Index extended only)
    else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      candidate = 'POINT';
      confidence = 0.92;
    }
    // 7. OPEN PALM (All 5 extended)
    else if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      candidate = 'OPEN_PALM';
      confidence = 0.94;
    }
    // 8. Default Open hand if 4 fingers extended
    else if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      candidate = 'OPEN_PALM';
      confidence = 0.85;
    }

    // Debounce / Hysteresis filter to eliminate transient flickers
    this.history.push(candidate);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }

    // Count occurrence of candidate in recent history
    const counts = new Map<HandGesture, number>();
    for (const g of this.history) {
      counts.set(g, (counts.get(g) || 0) + 1);
    }

    let dominantGesture = this.currentStableGesture;
    let maxCount = 0;
    for (const [g, count] of counts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantGesture = g;
      }
    }

    // If dominant gesture has at least 2 consistent votes, switch
    if (maxCount >= 2) {
      this.currentStableGesture = dominantGesture;
    }

    return {
      gesture: this.currentStableGesture,
      confidence,
      fingerStates: {
        thumb: thumbExtended,
        index: indexExtended,
        middle: middleExtended,
        ring: ringExtended,
        pinky: pinkyExtended,
      },
      pinchDistance: rawPinch,
      isPinching,
      palmSpan,
    };
  }

  public reset() {
    this.history = [];
    this.currentStableGesture = 'IDLE';
  }
}
