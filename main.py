"""
main.py
Main entry point for Python Hand Tracking Gesture & Air-Drawing Studio.
Run with:
    python3 main.py
"""

import argparse
import math
import sys
import time
from typing import List, Tuple
import cv2
import numpy as np

from HandTrackingModule import HandDetector
from gesture_engine import GestureEffectsEngine


# Keyboard layout
LETTERS = [
    "A", "B", "C", "D", "E", "F",
    "G", "H", "I", "J", "K", "L",
    "M", "N", "O", "P", "Q", "R",
    "S", "T", "U", "V", "W", "X",
    "Y", "Z", "_", "<",
]


class KeyBox:
    def __init__(self, x1: int, y1: int, x2: int, y2: int, letter: str):
        self.x1 = x1
        self.y1 = y1
        self.x2 = x2
        self.y2 = y2
        self.letter = letter
        self.display = "SPACE" if letter == "_" else "DEL" if letter == "<" else letter


def get_key_boxes(w: int, h: int) -> List[KeyBox]:
    cols = 7
    key_w = 48
    key_h = 42
    margin_x = 30
    margin_y = h - 210

    boxes = []
    for i, letter in enumerate(LETTERS):
        row = i // cols
        col = i % cols
        x1 = margin_x + col * (key_w + 6)
        y1 = margin_y + row * (key_h + 6)
        x2 = x1 + key_w
        y2 = y1 + key_h
        boxes.append(KeyBox(x1, y1, x2, y2, letter))
    return boxes


def run_app(camera_id: int = 0, width: int = 1280, height: int = 720):
    print("=" * 60)
    print("🚀 Initializing Hand Tracking Gesture & Anime Board (Python)")
    print("=" * 60)
    print("Controls:")
    print("  - Pinch Index & Thumb : Air-draw or tap virtual keys")
    print("  - Open Palm           : Cosmic Forcefield (repels particles)")
    print("  - V-Sign / Peace      : Sakura Domain Expansion")
    print("  - Clenched Fist       : Bankai Black Hole Singularity")
    print("  - Rock On             : Fire Dragon Embers")
    print("  - Thumbs Up           : Supernova Golden Fireworks")
    print("  - 'C' key             : Clear canvas")
    print("  - 'K' key             : Toggle virtual keyboard")
    print("  - 'S' key             : Save screenshot")
    print("  - 'ESC' / 'Q'         : Quit")
    print("=" * 60)

    cap = cv2.VideoCapture(camera_id)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

    if not cap.isOpened():
        print(f"❌ Error: Could not open camera {camera_id}.")
        print("Tip: If running in a headless container or remote server, use the Web Interface.")
        return

    detector = HandDetector(max_hands=2, detection_con=0.7, track_con=0.7)
    effects = GestureEffectsEngine()

    canvas = np.zeros((height, width, 3), dtype=np.uint8)
    prev_draw_pt = None
    show_keyboard = True
    command = ""
    last_type_time = 0.0

    fps_time = time.time()
    fps_count = 0
    fps_display = 30

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Failed to read video stream.")
            break

        frame = cv2.flip(frame, 1)
        frame = cv2.resize(frame, (width, height))

        # Detect hands and gestures
        frame, hands = detector.find_hands(frame, draw=True)
        key_boxes = get_key_boxes(width, height) if show_keyboard else []

        # FPS calculation
        fps_count += 1
        now = time.time()
        if now - fps_time >= 0.5:
            fps_display = int(fps_count / (now - fps_time))
            fps_count = 0
            fps_time = now

        primary_hand = hands[0] if hands else None
        active_gesture = primary_hand["gesture"] if primary_hand else "IDLE"

        # Check Bankai / Shadow clone trigger from fist or typed command
        if primary_hand and primary_hand["gesture"] == "FIST" and effects.active_effect != "BANKAI":
            effects.trigger_effect("BANKAI")

        hover_key = None

        if primary_hand:
            ix, iy = primary_hand["index_tip"]

            # Keyboard hover check
            if show_keyboard:
                for idx, box in enumerate(key_boxes):
                    if box.x1 <= ix <= box.x2 and box.y1 <= iy <= box.y2:
                        hover_key = idx
                        break

            # Typing when pinching over key
            if primary_hand["is_pinching"] and hover_key is not None:
                if now - last_type_time > 0.35:
                    box = key_boxes[hover_key]
                    if box.letter == "<":
                        command = command[:-1]
                    elif box.letter == "_":
                        command += " "
                    else:
                        command += box.letter

                    last_type_time = now

                    # Command triggers
                    upper_cmd = command.strip().upper()
                    if upper_cmd == "BANKAI":
                        effects.trigger_effect("BANKAI")
                        command = ""
                    elif upper_cmd == "SHADOW CLONE":
                        effects.trigger_effect("SHADOW CLONE")
                        command = ""

            # Air-drawing when pinching outside keyboard
            elif primary_hand["is_pinching"] and hover_key is None:
                curr_pt = (int(ix), int(iy))
                if prev_draw_pt is not None:
                    # Draw glowing laser stroke on canvas
                    cv2.line(canvas, prev_draw_pt, curr_pt, (6, 182, 212), 6, cv2.LINE_AA)
                    cv2.line(canvas, prev_draw_pt, curr_pt, (255, 255, 255), 2, cv2.LINE_AA)
                prev_draw_pt = curr_pt
            else:
                prev_draw_pt = None
        else:
            prev_draw_pt = None

        # Merge drawing canvas onto live frame
        gray_canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray_canvas, 10, 255, cv2.THRESH_BINARY)
        inv_mask = cv2.bitwise_not(mask)
        frame_bg = cv2.bitwise_and(frame, frame, mask=inv_mask)
        canvas_fg = cv2.bitwise_and(canvas, canvas, mask=mask)
        frame = cv2.add(frame_bg, canvas_fg)

        # Update and render particle physics & anime effects
        effects.update_and_render(frame, hands)

        # Render Virtual Keyboard if enabled
        if show_keyboard:
            overlay = frame.copy()
            for idx, box in enumerate(key_boxes):
                is_hover = (hover_key == idx)
                color = (255, 220, 0) if is_hover else (38, 38, 42)
                cv2.rectangle(overlay, (box.x1, box.y1), (box.x2, box.y2), color, -1)
                cv2.rectangle(overlay, (box.x1, box.y1), (box.x2, box.y2), (255, 255, 255), 1)

                text_color = (0, 0, 0) if is_hover else (255, 255, 255)
                scale = 0.4 if len(box.display) > 1 else 0.6
                cv2.putText(
                    overlay,
                    box.display,
                    (box.x1 + 8, box.y1 + 26),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    scale,
                    text_color,
                    1 if len(box.display) > 1 else 2,
                    cv2.LINE_AA,
                )
            cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)

        # HUD Top Bar
        cv2.rectangle(frame, (0, 0), (width, 42), (15, 15, 20), -1)
        cv2.line(frame, (0, 42), (width, 42), (60, 60, 70), 1)

        cv2.putText(
            frame,
            f"PYTHON GESTURE STUDIO | {fps_display} FPS | GESTURE: {active_gesture}",
            (18, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 220, 255),
            2,
            cv2.LINE_AA,
        )

        if command:
            cv2.putText(
                frame,
                f"CMD: {command}",
                (width - 320, 28),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.65,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

        cv2.imshow("Hand Tracking Gesture Studio (Python)", frame)

        # Handle keyboard input
        key = cv2.waitKey(1) & 0xFF
        if key in [ord("q"), ord("Q"), 27]:  # ESC or Q to quit
            break
        elif key in [ord("c"), ord("C")]:
            canvas = np.zeros((height, width, 3), dtype=np.uint8)
            command = ""
            print("🧹 Canvas cleared.")
        elif key in [ord("k"), ord("K")]:
            show_keyboard = not show_keyboard
        elif key in [ord("s"), ord("S")]:
            filename = f"capture_{int(time.time())}.png"
            cv2.imwrite(filename, frame)
            print(f"📸 Saved screenshot: {filename}")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hand Tracking Gesture & Anime Studio in Python")
    parser.add_argument("--camera", type=int, default=0, help="Camera device index (default: 0)")
    parser.add_argument("--width", type=int, default=1280, help="Frame width (default: 1280)")
    parser.add_argument("--height", type=int, default=720, help="Frame height (default: 720)")
    args = parser.parse_args()

    run_app(camera_id=args.camera, width=args.width, height=args.height)
