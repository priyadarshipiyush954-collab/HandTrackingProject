"""
HandTrackingModule.py
High-performance hand tracking module using OpenCV and MediaPipe.
Features scale-invariant gesture recognition, velocity-adaptive smoothing,
and cybernetic hand visualization.
"""

from collections import deque
import math
import time
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np

# Try importing MediaPipe Solutions or Tasks
try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False


class HandDetector:
    """
    High-accuracy 21-joint 3D hand tracking detector with
    velocity-adaptive exponential smoothing and scale-invariant gesture detection.
    """

    def __init__(
        self,
        mode: bool = False,
        max_hands: int = 2,
        detection_con: float = 0.7,
        track_con: float = 0.7,
    ):
        self.mode = mode
        self.max_hands = max_hands
        self.detection_con = detection_con
        self.track_con = track_con

        if MP_AVAILABLE:
            self.mp_hands = mp.solutions.hands
            self.hands = self.mp_hands.Hands(
                static_image_mode=self.mode,
                max_num_hands=self.max_hands,
                min_detection_confidence=self.detection_con,
                min_tracking_confidence=self.track_con,
            )
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_draw_styles = mp.solutions.drawing_styles
        else:
            self.hands = None

        # Velocity-adaptive smoothing filters
        self.prev_points: Dict[int, Tuple[float, float]] = {}
        self.gesture_history: deque = deque(maxlen=4)
        self.stable_gesture: str = "IDLE"

    def find_hands(
        self, img: np.ndarray, draw: bool = True
    ) -> Tuple[np.ndarray, List[Dict]]:
        """
        Processes frame and returns detected hands with landmarks and classified gestures.
        """
        h, w, _ = img.shape
        hands_data = []

        if not self.hands:
            return img, hands_data

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.hands.process(img_rgb)

        if results.multi_hand_landmarks:
            for hand_idx, hand_lms in enumerate(results.multi_hand_landmarks):
                landmarks = []
                for pt_idx, lm in enumerate(hand_lms.landmark):
                    raw_x = lm.x * w
                    raw_y = lm.y * h

                    # Velocity-adaptive dual-mode exponential smoothing
                    key = hand_idx * 100 + pt_idx
                    if key not in self.prev_points:
                        self.prev_points[key] = (raw_x, raw_y)
                        smooth_x, smooth_y = raw_x, raw_y
                    else:
                        prev_x, prev_y = self.prev_points[key]
                        dist_delta = math.hypot(raw_x - prev_x, raw_y - prev_y)
                        # Adaptive weight: 0.22 for hovering, 0.85 for fast flick
                        vel_norm = min(1.0, max(0.0, (dist_delta - 3.0) / 22.0))
                        alpha = 0.22 + vel_norm * 0.63
                        smooth_x = prev_x + alpha * (raw_x - prev_x)
                        smooth_y = prev_y + alpha * (raw_y - prev_y)
                        self.prev_points[key] = (smooth_x, smooth_y)

                    landmarks.append({"x": smooth_x, "y": smooth_y, "z": lm.z})

                # Key anatomical anchor points
                wrist = landmarks[0]
                thumb_tip = landmarks[4]
                index_tip = landmarks[8]
                middle_mcp = landmarks[9]
                pinky_tip = landmarks[20]

                # Palm Span for scale-invariant distance normalization
                palm_span = max(20.0, math.hypot(wrist["x"] - middle_mcp["x"], wrist["y"] - middle_mcp["y"]))

                # Palm Center
                palm_cx = (wrist["x"] + landmarks[5]["x"] + middle_mcp["x"] + landmarks[17]["x"]) / 4.0
                palm_cy = (wrist["y"] + landmarks[5]["y"] + middle_mcp["y"] + landmarks[17]["y"]) / 4.0

                # Pinch distance
                pinch_dist = math.hypot(index_tip["x"] - thumb_tip["x"], index_tip["y"] - thumb_tip["y"])
                is_pinching = (pinch_dist / palm_span) < 0.32

                # Classify gesture
                gesture, confidence = self._classify_gesture(landmarks, palm_span, is_pinching)

                hand_info = {
                    "landmarks": landmarks,
                    "palm_center": (palm_cx, palm_cy),
                    "palm_size": palm_span,
                    "index_tip": (index_tip["x"], index_tip["y"]),
                    "thumb_tip": (thumb_tip["x"], thumb_tip["y"]),
                    "pinky_tip": (pinky_tip["x"], pinky_tip["y"]),
                    "pinch_distance": pinch_dist,
                    "is_pinching": is_pinching,
                    "gesture": gesture,
                    "confidence": confidence,
                }
                hands_data.append(hand_info)

                if draw:
                    self.draw_cyber_skeleton(img, hand_info)

        return img, hands_data

    def _classify_gesture(
        self, landmarks: List[Dict], palm_span: float, is_pinching: bool
    ) -> Tuple[str, float]:
        """
        Classifies current hand pose into one of 7 scale-invariant gestures.
        """
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        thumb_mcp = landmarks[2]
        thumb_ip = landmarks[3]

        def dist(p1, p2):
            return math.hypot(p1["x"] - p2["x"], p1["y"] - p2["y"])

        # Check finger extensions
        index_ext = dist(landmarks[8], wrist) > dist(landmarks[6], wrist) * 1.18 and dist(landmarks[8], landmarks[5]) > palm_span * 0.6
        middle_ext = dist(landmarks[12], wrist) > dist(landmarks[10], wrist) * 1.18 and dist(landmarks[12], landmarks[9]) > palm_span * 0.6
        ring_ext = dist(landmarks[16], wrist) > dist(landmarks[14], wrist) * 1.18 and dist(landmarks[16], landmarks[13]) > palm_span * 0.55
        pinky_ext = dist(landmarks[20], wrist) > dist(landmarks[18], wrist) * 1.18 and dist(landmarks[20], landmarks[17]) > palm_span * 0.5
        thumb_ext = dist(thumb_tip, landmarks[17]) > palm_span * 0.85

        candidate = "IDLE"
        conf = 0.8

        if is_pinching:
            candidate = "PINCH"
            conf = 0.95
        elif (
            not index_ext
            and not middle_ext
            and not ring_ext
            and not pinky_ext
            and thumb_tip["y"] < thumb_ip["y"]
            and thumb_tip["y"] < thumb_mcp["y"] - palm_span * 0.15
        ):
            candidate = "THUMBS_UP"
            conf = 0.94
        elif not index_ext and not middle_ext and not ring_ext and not pinky_ext:
            candidate = "FIST"
            conf = 0.92
        elif index_ext and pinky_ext and not middle_ext and not ring_ext:
            candidate = "ROCK_ON"
            conf = 0.93
        elif index_ext and middle_ext and not ring_ext and not pinky_ext:
            candidate = "PEACE"
            conf = 0.91
        elif index_ext and not middle_ext and not ring_ext and not pinky_ext:
            candidate = "POINT"
            conf = 0.92
        elif index_ext and middle_ext and ring_ext and pinky_ext:
            candidate = "OPEN_PALM"
            conf = 0.94

        # Debounce filter
        self.gesture_history.append(candidate)
        counts = {g: self.gesture_history.count(g) for g in set(self.gesture_history)}
        dominant = max(counts, key=counts.get)
        if counts[dominant] >= 2:
            self.stable_gesture = dominant

        return self.stable_gesture, conf

    def draw_cyber_skeleton(self, img: np.ndarray, hand: Dict):
        """
        Renders cybernetic hand bone lines and glowing joint nodes.
        """
        lms = hand["landmarks"]
        gesture = hand["gesture"]

        # Color themes (BGR)
        palette = {
            "PINCH": (212, 182, 6),
            "POINT": (246, 130, 59),
            "OPEN_PALM": (129, 185, 16),
            "PEACE": (153, 72, 236),
            "FIST": (68, 68, 239),
            "ROCK_ON": (22, 115, 249),
            "THUMBS_UP": (8, 179, 234),
            "IDLE": (180, 180, 180),
        }
        color = palette.get(gesture, (200, 200, 200))

        # Bone linkages
        connections = [
            (0, 1), (1, 2), (2, 3), (3, 4),
            (0, 5), (5, 6), (6, 7), (7, 8),
            (5, 9), (9, 10), (10, 11), (11, 12),
            (9, 13), (13, 14), (14, 15), (15, 16),
            (13, 17), (17, 18), (18, 19), (19, 20),
            (0, 17),
        ]

        # Draw bones
        for start, end in connections:
            pt1 = (int(lms[start]["x"]), int(lms[start]["y"]))
            pt2 = (int(lms[end]["x"]), int(lms[end]["y"]))
            cv2.line(img, pt1, pt2, color, 3, cv2.LINE_AA)

        # Draw joints
        for i, pt in enumerate(lms):
            center = (int(pt["x"]), int(pt["y"]))
            radius = 6 if i in [4, 8, 12, 16, 20] else 3
            cv2.circle(img, center, radius, (255, 255, 255), -1, cv2.LINE_AA)
            cv2.circle(img, center, radius + 1, color, 1, cv2.LINE_AA)

        # Draw wrist HUD badge
        wrist = (int(lms[0]["x"]), int(lms[0]["y"]) + 35)
        text = f"[{gesture}]"
        cv2.putText(
            img,
            text,
            wrist,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 0),
            3,
            cv2.LINE_AA,
        )
        cv2.putText(
            img,
            text,
            wrist,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2,
            cv2.LINE_AA,
        )
