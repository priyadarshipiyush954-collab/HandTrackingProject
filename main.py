import math
import time
from collections import deque

import cv2
import numpy as np

from HandTrackingModule import HandDetector

LETTERS = [
    "A", "B", "C", "D", "E", "F",
    "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R",
    "S", "T", "U", "V", "W", "X",
    "Y", "Z", "_", "<",
]


class AnimeEffect:
    def __init__(self, name, duration=2.6):
        self.name = name
        self.duration = duration
        self.started = time.time()

    @property
    def done(self):
        return (time.time() - self.started) > self.duration


def draw_keyboard(frame, selected_idx=None):
    key_w, key_h = 70, 52
    cols = 7
    margin_x, margin_y = 20, 360
    key_boxes = []

    for i, letter in enumerate(LETTERS):
        row, col = divmod(i, cols)
        x1 = margin_x + col * (key_w + 8)
        y1 = margin_y + row * (key_h + 8)
        x2, y2 = x1 + key_w, y1 + key_h
        key_boxes.append((x1, y1, x2, y2, letter))

        active = selected_idx == i
        color = (0, 220, 255) if active else (35, 35, 35)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, cv2.FILLED)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)

        display = "_" if letter == "_" else ("DEL" if letter == "<" else letter)
        cv2.putText(frame, display, (x1 + 12, y1 + 34), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)

    return key_boxes


def get_hover_key(index_tip, key_boxes):
    if index_tip is None:
        return None
    x, y = index_tip
    for i, (x1, y1, x2, y2, _) in enumerate(key_boxes):
        if x1 <= x <= x2 and y1 <= y <= y2:
            return i
    return None


def pinch_distance(lm_list):
    x1, y1 = lm_list[4][1], lm_list[4][2]
    x2, y2 = lm_list[8][1], lm_list[8][2]
    return math.hypot(x2 - x1, y2 - y1)


def draw_effect(frame, effect):
    h, w, _ = frame.shape
    ratio = min(1.0, (time.time() - effect.started) / effect.duration)
    overlay = frame.copy()

    if effect.name == "BANKAI":
        pulse = 0.12 * np.sin(ratio * 18)
        radius = int((95 + ratio * 320) * (1 + pulse))
        cv2.circle(overlay, (w // 2, h // 2), radius, (0, 0, 230), thickness=16)
        cv2.circle(overlay, (w // 2, h // 2), int(radius * 0.65), (20, 20, 150), thickness=10)
        cv2.putText(overlay, "BANKAI", (w // 2 - 130, h // 2), cv2.FONT_HERSHEY_DUPLEX, 2, (255, 255, 255), 4)
    elif effect.name == "SHADOW CLONE":
        wave = np.sin(ratio * 24)
        for i in range(6):
            spread = int((i - 2.5) * 110 + wave * 25 * (i % 2 * 2 - 1))
            cx = w // 2 + spread
            cy = h // 2 + int(18 * np.cos(ratio * 20 + i))
            cv2.circle(overlay, (cx, cy), 52, (240, 240, 240), 3)
        cv2.putText(overlay, "SHADOW CLONE", (w // 2 - 220, h // 2 + 120), cv2.FONT_HERSHEY_DUPLEX, 1.35, (255, 255, 255), 3)

    cv2.addWeighted(overlay, 0.50, frame, 0.50, 0, frame)


def run():
    cap = cv2.VideoCapture(0)
    detector = HandDetector(detectionCon=0.75, trackCon=0.75)

    canvas = None
    command = ""
    cursor_history = deque(maxlen=7)
    last_draw_point = None
    trail_point = None
    last_trigger = 0
    active_effect = None
    smooth_point = None
    ema_alpha = 0.35

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        frame = cv2.flip(frame, 1)
        if canvas is None:
            canvas = np.zeros_like(frame)

        detector.findHands(frame, draw=True)
        lm_list = detector.findPosition(frame, draw=False)

        if lm_list:
            index_tip = (lm_list[8][1], lm_list[8][2])
            pinch = pinch_distance(lm_list)
            cursor_history.append(index_tip)

            avg_x = sum(p[0] for p in cursor_history) / len(cursor_history)
            avg_y = sum(p[1] for p in cursor_history) / len(cursor_history)
            if smooth_point is None:
                smooth_point = (int(avg_x), int(avg_y))
            else:
                smooth_point = (
                    int((1 - ema_alpha) * smooth_point[0] + ema_alpha * avg_x),
                    int((1 - ema_alpha) * smooth_point[1] + ema_alpha * avg_y),
                )

            key_boxes = draw_keyboard(frame)
            hover_key = get_hover_key(smooth_point, key_boxes)
            draw_keyboard(frame, selected_idx=hover_key)
            cv2.circle(frame, smooth_point, 8, (0, 255, 0), cv2.FILLED)

            if pinch < 35 and hover_key is not None and time.time() - last_trigger > 0.35:
                key_val = LETTERS[hover_key]
                command = command[:-1] if key_val == "<" else command + (" " if key_val == "_" else key_val)
                last_trigger = time.time()

            if pinch < 26 and hover_key is None:
                if last_draw_point is None:
                    last_draw_point = smooth_point
                if trail_point is None:
                    trail_point = smooth_point

                interp_steps = max(2, int(math.hypot(smooth_point[0] - trail_point[0], smooth_point[1] - trail_point[1]) // 6))
                for t in range(1, interp_steps + 1):
                    x = int(trail_point[0] + (smooth_point[0] - trail_point[0]) * t / interp_steps)
                    y = int(trail_point[1] + (smooth_point[1] - trail_point[1]) * t / interp_steps)
                    cv2.line(canvas, last_draw_point, (x, y), (255, 255, 255), 6)
                    last_draw_point = (x, y)
                trail_point = smooth_point
            else:
                last_draw_point = None
                trail_point = None
        else:
            draw_keyboard(frame)
            smooth_point = None
            cursor_history.clear()
            last_draw_point = None
            trail_point = None

        upper_cmd = command.strip().upper()
        if upper_cmd in {"BANKAI", "SHADOW CLONE"}:
            active_effect = AnimeEffect(upper_cmd)
            command = ""

        if active_effect:
            draw_effect(frame, active_effect)
            if active_effect.done:
                active_effect = None

        blended = cv2.addWeighted(frame, 0.82, canvas, 0.45, 0)
        cv2.rectangle(blended, (15, 15), (880, 86), (15, 15, 15), cv2.FILLED)
        cv2.rectangle(blended, (15, 15), (880, 86), (255, 255, 255), 2)
        cv2.putText(blended, "Air Draw: pinch away from keyboard | Type: pinch a key", (25, 42),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.62, (210, 210, 210), 2)
        cv2.putText(blended, f"Command: {command}", (25, 72), cv2.FONT_HERSHEY_SIMPLEX, 0.72, (0, 220, 255), 2)
        cv2.putText(blended, "Trigger words: BANKAI, SHADOW CLONE | C=clear canvas | ESC=exit", (15, 350),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.62, (255, 255, 255), 2)

        cv2.imshow("Hand Tracking Anime Board", blended)
        key = cv2.waitKey(1) & 0xFF
        if key == 27:
            break
        if key in (ord("c"), ord("C")):
            canvas[:] = 0
            command = ""
            active_effect = None

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run()
