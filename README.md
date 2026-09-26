# Aetheria — Hand Gesture & Vision Studio

A high-performance in-browser computer vision application that turns your webcam into an interactive magic canvas. Powered by MediaPipe 21-joint 3D hand tracking, velocity-adaptive filtering, particle physics, and generative Web Audio synthesis.

---

## ✨ Features

- **7 Real-Time Hand Gestures**: Scale-invariant recognition triggers distinct physical forces, visual effects, and audio tones.
- **Velocity-Adaptive Smoothing Filter**:
  - **High Velocity**: $\alpha \to 0.85$ (zero-lag tracking for fast flicks and rapid strokes).
  - **Low Velocity**: $\alpha \to 0.22$ (rock-solid tremor dampening for precision pointing and hovering).
- **Interactive Particle Physics**: Real-time gravitational singularities, shockwaves, sakura petal turbulence, and rising flame embers.
- **5 Dynamic Brush Styles**:
  - **Neon Laser**: Blooming sci-fi cyber beam.
  - **Fire Dragon**: Scorching orange and golden flame trail.
  - **Celestial**: Ethereal violet stardust calligraphy with shimmer sparks.
  - **Rainbow**: Dynamic cycling chromatic spectrum.
  - **Cyber Ink**: Crisp digital vector stroke.
- **Generative Web Audio Synthesizer**: Custom procedural sound design for each gesture (sub-bass gravity collapses, fire roars, laser clicks, and pentatonic chimes).
- **Holographic Hand Skeleton**: Live bone linkages, pulsing joint nodes, and floating wrist HUD badge showing current gesture and confidence.
- **Air Keyboard Mode**: 28-key on-screen virtual keyboard with pinch-to-type detection.
- **Mouse & Simulation Mode**: Full mouse and keyboard fallback (keys `1`–`7`, `Space`, `C`) to test every gesture even without a camera.

---

## 🖐️ Gesture Reference Guide

| Gesture | Pose / Action | Visual Effect | Physics / Interaction | Audio Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **Air Draw** `👌` | Pinch Thumb & Index | Glowing air-trail brush | Interpolated continuous stroke | Crisp laser click |
| **Plasma Laser** `👉` | Extend Index finger only | Concentrated laser ray | High-precision spark stream | Sci-fi laser pulse |
| **Force Field** `✋` | Open all 5 fingers | Expanding emerald shockwave | Radial repulsive forcefield | Cosmic resonant wave |
| **Sakura Domain** `✌️` | Index + Middle (V-Sign) | Serene cherry blossom storm | Floating petal flutter | Pentatonic wind chime |
| **Bankai Singularity** `✊` | Clench all fingers into Fist | Dark red lightning singularity | Gravitational black hole vortex | Sub-bass rumble |
| **Fire Dragon** `🤘` | Index & Pinky extended | Rising flame aura | Hot buoyant heat embers | Combustion whoosh & roar |
| **Supernova Burst** `👍` | Thumb pointing upward alone | Golden star explosion | Radial starburst fireworks | Triumphant arpeggio |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| **`C`** | Clear canvas strokes and particle effects |
| **`Space` / Click** | Simulate pinch (in Mouse Mode) |
| **`1`** | Trigger **Air Draw** (`PINCH`) |
| **`2`** | Trigger **Plasma Laser** (`POINT`) |
| **`3`** | Trigger **Force Field** (`OPEN_PALM`) |
| **`4`** | Trigger **Sakura Domain** (`PEACE`) |
| **`5`** | Trigger **Bankai Singularity** (`FIST`) |
| **`6`** | Trigger **Fire Dragon** (`ROCK_ON`) |
| **`7`** | Trigger **Supernova Burst** (`THUMBS_UP`) |

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Hand Tracking**: [@mediapipe/tasks-vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (21-joint 3D hand landmark model with GPU and CPU fallback delegates)
- **Audio Engine**: Native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (procedural oscillator networks, biquad filters, and noise buffers)
- **Rendering**: Multi-layer HTML5 Canvas with dual buffering and vector interpolation

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- A modern browser with WebGL and Camera permissions enabled (Chrome, Edge, Brave, Firefox, or Safari)

### Installation

```bash
# Install dependencies
npm install

# Start local development server on port 3000
npm run dev
```

Open `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
```

---

## 💡 Tips for Optimal Tracking Accuracy

1. **Lighting**: Ensure your hand is well-illuminated and distinct from your background.
2. **Camera Distance**: Position your hand approximately 1.5 to 3 feet (45–90 cm) away from the webcam.
3. **Finger Separation**: When changing gestures, hold fingers clearly in their intended pose for 1–2 frames for instant latching.
