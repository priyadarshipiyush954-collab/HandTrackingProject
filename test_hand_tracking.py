"""
test_hand_tracking.py
Unit tests for the Hand Tracking Module and Gesture Engine for pytest in CI.
"""

import math
import numpy as np
import pytest

from HandTrackingModule import HandDetector
from gesture_engine import GestureEffectsEngine, Particle


def test_hand_detector_initialization():
    detector = HandDetector(mode=False, max_hands=2, detection_con=0.7, track_con=0.7)
    assert detector.max_hands == 2
    assert detector.detection_con == 0.7
    assert detector.stable_gesture == "IDLE"


def test_gesture_effects_engine_initialization():
    engine = GestureEffectsEngine()
    assert len(engine.particles) == 0
    assert engine.active_effect is None

    engine.trigger_effect("BANKAI")
    assert engine.active_effect == "BANKAI"


def test_particle_creation():
    p = Particle(x=100.0, y=200.0, vx=1.5, vy=-2.0, color=(0, 255, 0), size=5.0, life=30, p_type="spark")
    assert p.x == 100.0
    assert p.y == 200.0
    assert p.life == 0
    assert p.max_life == 30
    assert p.type == "spark"


def test_synthetic_frame_processing():
    detector = HandDetector()
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    processed_frame, hands = detector.find_hands(dummy_frame, draw=False)
    assert processed_frame.shape == (480, 640, 3)
    assert isinstance(hands, list)
