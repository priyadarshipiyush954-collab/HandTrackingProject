"""
test.py
Quick diagnostic script to verify Python OpenCV and MediaPipe installations.
"""

import sys

print("Checking Python environment...")
print(f"Python version: {sys.version}")

try:
    import cv2
    print(f"✅ OpenCV version: {cv2.__version__}")
except ImportError as e:
    print(f"❌ OpenCV not found: {e}")

try:
    import mediapipe as mp
    print(f"✅ MediaPipe version: {mp.__version__}")
except ImportError as e:
    print(f"❌ MediaPipe not found: {e}")

try:
    import numpy as np
    print(f"✅ NumPy version: {np.__version__}")
except ImportError as e:
    print(f"❌ NumPy not found: {e}")

print("\nReady! Run: python3 main.py")
