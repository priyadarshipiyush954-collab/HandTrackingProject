# Python Hand Tracking Gesture & Air-Drawing Studio

A computer vision application built with **Python 3.10+**, **OpenCV**, and **MediaPipe**. Features 21-joint 3D hand tracking, scale-invariant gesture recognition, velocity-adaptive smoothing, dynamic air-drawing, virtual typing, and special effects (*Bankai*, *Shadow Clone*, *Fire Dragon*, *Sakura Domain*, and *Supernova*).

This repository contains both the standalone **native Python desktop application** and an **in-browser interactive preview** for instant testing.

---

## 🐍 Python Project Structure

```
├── main.py                   # Master application: OpenCV video loop, drawing, keyboard, effects
├── HandTrackingModule.py     # Core detector: MediaPipe hands, velocity-adaptive smoothing
├── gesture_engine.py         # Particle physics & anime animation renderer in Python
├── HandtrackingMinimum.py    # Minimal standalone hand tracking script
├── test.py                   # Diagnostic environment verification script
├── requirements.txt          # Python package dependencies
└── src/                      # Interactive in-browser web companion and code inspector
```

---

## 🚀 Quickstart (Python)

### 1. Requirements

- Python 3.10 or higher
- A webcam connected to your machine

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

*(Or manually install `pip install opencv-python mediapipe numpy`)*

### 3. Verify Environment

```bash
python3 test.py
```

### 4. Run the Python Application

```bash
python3 main.py
```

Optional CLI flags:
```bash
python3 main.py --camera 0 --width 1280 --height 720
```

---

## 🖐️ Hand Gestures Reference

| Gesture | How to Perform | In-App Action | Effect |
| :--- | :--- | :--- | :--- |
| **Air Draw** `👌` | Pinch Thumb tip & Index tip together | Air-draw glowing laser trails or type on keyboard | Continuous glowing brush |
| **Plasma Laser** `👉` | Extend Index finger only (others curled) | Focus directional laser beam | High-velocity sparks |
| **Force Field** `✋` | Open all 5 fingers outward | Repulsive cosmic forcefield | Pushes floating particles away |
| **Sakura Domain** `✌️` | Index + Middle extended (V-sign) | Summon Sakura storm | Drifting cherry petals |
| **Bankai Singularity** `✊` | Clench all fingers into a Fist | Dark matter black hole | Gravitational vortex & dark lightning |
| **Fire Dragon** `🤘` | Index & Pinky extended (Rock-on) | Dragon firestorm | Rising orange & yellow flame embers |
| **Supernova Burst** `👍` | Thumb pointing upward alone | Golden star explosion | Radial fireworks shower |

---

## ⌨️ Desktop Controls & Hotkeys

- **Pinch Index + Thumb**: Draw or tap virtual keyboard keys.
- **`C`**: Clear canvas drawing.
- **`K`**: Toggle the on-screen virtual keyboard.
- **`S`**: Save screenshot to PNG (`capture_<timestamp>.png`).
- **`Q` / `ESC`**: Quit the application.

---

## 🧠 Python Architecture & Algorithms

### 1. Velocity-Adaptive Dual-Mode Smoothing
To eliminate camera sensor noise and hand tremor without introducing drawing lag:
$$\alpha = 0.22 + \min\left(1.0, \max\left(0.0, \frac{\Delta d - 3.0}{22.0}\right)\right) \times 0.63$$
- **Hovering / Slow movement ($\Delta d \le 3\text{px}$)**: $\alpha = 0.22$ (high dampening, rock-solid tremor cancellation).
- **Fast flicks ($\Delta d \ge 25\text{px}$)**: $\alpha \to 0.85$ (instant response, zero smoothing delay).

### 2. Scale-Invariant Geometry
Landmark distances are normalized by **Palm Span** ($Wrist \to Middle\ MCP$). Gestures are recognized consistently regardless of distance from the camera or user hand size.
