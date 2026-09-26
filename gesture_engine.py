"""
gesture_engine.py
Visual effects and particle physics engine for OpenCV Python application.
Handles Bankai Singularity, Shadow Clones, Fire Dragon, Sakura Domain, and Supernova.
"""

import math
import random
import time
from typing import Dict, List, Optional
import cv2
import numpy as np


class Particle:
    def __init__(self, x: float, y: float, vx: float, vy: float, color: tuple, size: float, life: int, p_type: str = "spark"):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.color = color  # (B, G, R)
        self.size = size
        self.life = 0
        self.max_life = life
        self.type = p_type


class GestureEffectsEngine:
    def __init__(self):
        self.particles: List[Particle] = []
        self.active_effect: Optional[str] = None
        self.effect_start_time: float = 0.0
        self.effect_duration: float = 2.6

    def trigger_effect(self, effect_name: str):
        self.active_effect = effect_name
        self.effect_start_time = time.time()

    def update_and_render(self, frame: np.ndarray, hands: List[Dict]):
        h, w, _ = frame.shape
        primary_hand = hands[0] if hands else None

        # 1. Spawn particles depending on active hand gesture
        if primary_hand:
            g = primary_hand["gesture"]
            palm_cx, palm_cy = primary_hand["palm_center"]
            index_x, index_y = primary_hand["index_tip"]

            if g == "ROCK_ON":
                # Fire Dragon embers
                for _ in range(4):
                    self.particles.append(
                        Particle(
                            index_x + random.uniform(-10, 10),
                            index_y + random.uniform(-10, 10),
                            random.uniform(-1.5, 1.5),
                            random.uniform(-5, -2),
                            (22, 115, 249) if random.random() > 0.4 else (8, 234, 250),
                            random.uniform(4, 9),
                            random.randint(20, 40),
                            "ember",
                        )
                    )
            elif g == "PEACE":
                # Sakura petals
                if random.random() > 0.4:
                    self.particles.append(
                        Particle(
                            palm_cx + random.uniform(-70, 70),
                            palm_cy + random.uniform(-70, 70),
                            random.uniform(-1.2, 1.2),
                            random.uniform(1.2, 2.8),
                            (182, 114, 244),
                            random.uniform(6, 12),
                            random.randint(40, 70),
                            "sakura",
                        )
                    )
            elif g == "POINT":
                # Plasma beam sparks
                for _ in range(3):
                    angle = math.atan2(index_y - palm_cy, index_x - palm_cx)
                    speed = random.uniform(6, 14)
                    self.particles.append(
                        Particle(
                            index_x,
                            index_y,
                            math.cos(angle + random.uniform(-0.2, 0.2)) * speed,
                            math.sin(angle + random.uniform(-0.2, 0.2)) * speed,
                            (248, 189, 56),
                            random.uniform(2.5, 5),
                            random.randint(15, 30),
                            "spark",
                        )
                    )
            elif g == "THUMBS_UP":
                # Golden Supernova
                for _ in range(4):
                    angle = random.uniform(0, math.pi * 2)
                    speed = random.uniform(3, 8)
                    self.particles.append(
                        Particle(
                            primary_hand["thumb_tip"][0],
                            primary_hand["thumb_tip"][1],
                            math.cos(angle) * speed,
                            math.sin(angle) * speed,
                            (21, 204, 250),
                            random.uniform(4, 7),
                            random.randint(25, 45),
                            "star",
                        )
                    )

        # 2. Update existing particles with physics
        next_particles = []
        for p in self.particles:
            p.life += 1
            if p.life >= p.max_life:
                continue

            # Physics force from hand
            if primary_hand:
                palm_cx, palm_cy = primary_hand["palm_center"]
                dx = palm_cx - p.x
                dy = palm_cy - p.y
                d = math.hypot(dx, dy)

                if primary_hand["gesture"] == "OPEN_PALM" and d < 220 and d > 5:
                    # Repulsive force
                    force = (1.0 - d / 220.0) * 12.0
                    p.vx -= (dx / d) * force
                    p.vy -= (dy / d) * force
                elif primary_hand["gesture"] == "FIST" and d < 350 and d > 10:
                    # Gravitational vortex
                    force = (1.0 - d / 350.0) * 8.0
                    p.vx += (dx / d) * force
                    p.vy += (dy / d) * force

            if p.type == "ember":
                p.vy -= 0.12
            elif p.type == "sakura":
                p.vx += math.sin(p.life * 0.1) * 0.35

            p.x += p.vx
            p.y += p.vy
            next_particles.append(p)

            # Draw particle
            pt = (int(p.x), int(p.y))
            if 0 <= pt[0] < w and 0 <= pt[1] < h:
                alpha = max(0.1, 1.0 - p.life / p.max_life)
                radius = max(1, int(p.size * alpha))
                cv2.circle(frame, pt, radius, p.color, -1, cv2.LINE_AA)

        self.particles = next_particles[-300:]

        # 3. Render Special Animations (Bankai / Shadow Clone)
        if self.active_effect:
            elapsed = time.time() - self.effect_start_time
            ratio = min(1.0, elapsed / self.effect_duration)

            if self.active_effect == "BANKAI":
                self._render_bankai(frame, w, h, ratio)
            elif self.active_effect == "SHADOW CLONE":
                self._render_shadow_clone(frame, w, h, ratio)

            if elapsed >= self.effect_duration:
                self.active_effect = None

    def _render_bankai(self, frame: np.ndarray, w: int, h: int, ratio: float):
        cx, cy = w // 2, h // 2
        pulse = 0.12 * math.sin(ratio * 18)
        radius = int(max(10, (95 + ratio * 320) * (1 + pulse)))

        # Outer crimson ring
        cv2.circle(frame, (cx, cy), radius, (38, 38, 220), 14, cv2.LINE_AA)
        # Inner dark blood-red ring
        cv2.circle(frame, (cx, cy), max(5, int(radius * 0.65)), (20, 20, 160), 8, cv2.LINE_AA)
        # Core white ring
        cv2.circle(frame, (cx, cy), max(2, int(radius * 0.35)), (255, 255, 255), 3, cv2.LINE_AA)

        # Cross slashes
        slash_angle = ratio * math.pi * 2
        p1 = (int(cx - math.cos(slash_angle) * radius), int(cy - math.sin(slash_angle) * radius))
        p2 = (int(cx + math.cos(slash_angle) * radius), int(cy + math.sin(slash_angle) * radius))
        cv2.line(frame, p1, p2, (255, 255, 255), 2, cv2.LINE_AA)

        # Text
        cv2.putText(frame, "BANKAI", (cx - 130, cy + 15), cv2.FONT_HERSHEY_TRIPLEX, 2.2, (0, 0, 0), 8, cv2.LINE_AA)
        cv2.putText(frame, "BANKAI", (cx - 130, cy + 15), cv2.FONT_HERSHEY_TRIPLEX, 2.2, (255, 255, 255), 3, cv2.LINE_AA)

    def _render_shadow_clone(self, frame: np.ndarray, w: int, h: int, ratio: float):
        cx, cy = w // 2, h // 2
        wave = math.sin(ratio * 24)

        for i in range(6):
            spread = int((i - 2.5) * 110 + wave * 25 * (i % 2 * 2 - 1))
            clone_x = cx + spread
            clone_y = cy + int(18 * math.cos(ratio * 20 + i))

            cv2.circle(frame, (clone_x, clone_y), 52, (240, 240, 240), 3, cv2.LINE_AA)
            cv2.circle(frame, (clone_x, clone_y), 28, (248, 189, 56), -1, cv2.LINE_AA)
            cv2.putText(frame, f"#{i+1}", (clone_x - 12, clone_y + 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2, cv2.LINE_AA)

        cv2.putText(frame, "SHADOW CLONE", (cx - 200, cy + 120), cv2.FONT_HERSHEY_TRIPLEX, 1.8, (0, 0, 0), 6, cv2.LINE_AA)
        cv2.putText(frame, "SHADOW CLONE", (cx - 200, cy + 120), cv2.FONT_HERSHEY_TRIPLEX, 1.8, (255, 255, 255), 2, cv2.LINE_AA)
