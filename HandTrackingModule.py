import cv2
import mediapipe as mp

class HandDetector:
    def __init__(self, detectionCon=0.5, trackCon=0.5):
        from mediapipe.tasks.python import vision
        from mediapipe.tasks.python import BaseOptions

        self.vision = vision
        self.BaseOptions = BaseOptions

        self.options = vision.HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
            num_hands=2
        )

        self.detector = vision.HandLandmarker.create_from_options(self.options)
        self.results = None

    def findHands(self, img, draw=True):
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        self.results = self.detector.detect(mp_image)

        if draw and self.results.hand_landmarks:
            for hand in self.results.hand_landmarks:
                for lm in hand:
                    h, w, _ = img.shape
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    cv2.circle(img, (cx, cy), 5, (0, 255, 0), cv2.FILLED)

        return img

    def findPosition(self, img, draw=False):
        lm_list = []

        if self.results and self.results.hand_landmarks:
            hand = self.results.hand_landmarks[0]

            for id, lm in enumerate(hand):
                h, w, _ = img.shape
                cx, cy = int(lm.x * w), int(lm.y * h)
                lm_list.append([id, cx, cy])

                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)

        return lm_list