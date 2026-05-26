# Hand Tracking Anime Board

A webcam hand-tracking app using OpenCV + MediaPipe Tasks.

## Features
- Smooth hand tracking with moving-average + EMA cursor filtering.
- Smooth air-drawing with interpolation between frames.
- Virtual keyboard for typing gesture commands.
- Animated effects for `BANKAI` and `SHADOW CLONE`.
- Pinch-to-type and pinch-to-draw interactions.

## Controls
- **Pinch on key**: type letters.
- **Pinch away from keyboard**: draw on canvas.
- **Type `BANKAI` or `SHADOW CLONE`**: trigger animations.
- **C**: clear canvas.
- **ESC**: quit.

## Setup
1. Install Python 3.10+.
2. Install deps:
   ```bash
   pip install opencv-python mediapipe numpy
   ```
3. Ensure `hand_landmarker.task` is in project root.
4. Run:
   ```bash
   python main.py
   ```

## Files
- `main.py` – application loop, smoothing, drawing, and anime effects.
- `HandTrackingModule.py` – MediaPipe hand detector wrapper.
- `HandtrackingMinimum.py` – minimal/basic tracking demo.
