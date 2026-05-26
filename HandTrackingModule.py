import cv2
import mediapipe as mp


class HandDetector:
    def __init__(self, detectionCon=0.5, trackCon=0.5, num_hands=2):
        from mediapipe.tasks.python import BaseOptions, vision

        self.options = vision.HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
            num_hands=num_hands,
            min_hand_detection_confidence=detectionCon,
            min_tracking_confidence=trackCon,
        )
        self.detector = vision.HandLandmarker.create_from_options(self.options)
        self.results = None

    def findHands(self, img, draw=True):
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        self.results = self.detector.detect(mp_image)

        if draw and self.results.hand_landmarks:
            h, w, _ = img.shape
            for hand in self.results.hand_landmarks:
                for lm in hand:
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    cv2.circle(img, (cx, cy), 4, (0, 255, 0), cv2.FILLED)

        return img

    def findPosition(self, img, draw=False, hand_no=0):
        lm_list = []
        if self.results and self.results.hand_landmarks and hand_no < len(self.results.hand_landmarks):
            hand = self.results.hand_landmarks[hand_no]
            h, w, _ = img.shape
            for idx, lm in enumerate(hand):
                cx, cy = int(lm.x * w), int(lm.y * h)
                lm_list.append([idx, cx, cy])
                if draw:
                    cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)
        return lm_list
