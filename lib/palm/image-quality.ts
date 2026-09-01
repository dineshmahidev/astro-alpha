/**
 * IMAGE QUALITY CHECK
 * -------------------
 * Assesses the quality of a palm image before line detection.
 * Returns confidence score and identified issues.
 */

import { ImageQuality } from './types';

/**
 * Assess image quality from MediaPipe hand detection results.
 * @param handDetected Whether a hand was detected
 * @param landmarkCount Number of landmarks detected (max 21)
 * @param confidence MediaPipe detection confidence
 * @param imageWidth Image width in pixels
 * @param imageHeight Image height in pixels
 */
export function assessImageQuality(
  handDetected: boolean,
  landmarkCount: number,
  confidence: number,
  imageWidth: number,
  imageHeight: number,
): ImageQuality {
  const issues: string[] = [];
  let score = 0;

  // Hand detection
  if (!handDetected) {
    issues.push('No hand detected in image');
    return { score: 0, issues, sufficient: false };
  }
  score += 0.3;

  // Landmark completeness
  const landmarkRatio = landmarkCount / 21;
  score += landmarkRatio * 0.3;
  if (landmarkCount < 21) {
    issues.push(`Only ${landmarkCount}/21 landmarks detected — some fingers may be occluded`);
  }

  // Detection confidence
  score += confidence * 0.2;
  if (confidence < 0.5) {
    issues.push('Low detection confidence — image may be blurry or poorly lit');
  }

  // Image resolution
  const minDimension = Math.min(imageWidth, imageHeight);
  if (minDimension < 300) {
    issues.push('Image resolution too low — use a higher resolution photo');
    score -= 0.1;
  } else {
    score += 0.1;
  }

  // Aspect ratio check (palm should be roughly vertical)
  const aspectRatio = imageWidth / imageHeight;
  if (aspectRatio > 1.5 || aspectRatio < 0.5) {
    issues.push('Unusual image aspect ratio — palm may be rotated');
    score -= 0.05;
  }

  const finalScore = Math.max(0, Math.min(1, score));

  return {
    score: finalScore,
    issues,
    sufficient: finalScore >= 0.5 && landmarkCount >= 15,
  };
}

/**
 * Generate a user-friendly quality message.
 */
export function qualityMessage(q: ImageQuality, lang: string): string | null {
  if (q.sufficient) return null;

  if (lang === 'ta') {
    if (q.issues.some(i => i.includes('No hand'))) {
      return 'Indha photo-la kai clear-aa theriyala. Konjam better lighting-la straight-aa palm photo upload pannunga.';
    }
    return 'Photo quality kammi-aa irukku. Konjam bright light-la, kai straight-aa vaangi photo eduthutu upload pannunga.';
  }
  if (lang === 'hi') {
    if (q.issues.some(i => i.includes('No hand'))) {
      return 'Is photo mein haath saaf dikh nahi raha. Kripya achhi roshni mein seedhi palm photo upload karein.';
    }
    return 'Photo ki gunvatta kam hai. Kripya ujli roshni mein, haath seedha karke photo lein.';
  }
  if (q.issues.some(i => i.includes('No hand'))) {
    return 'The palm is not clearly visible. Please upload a straight palm photo in better lighting.';
  }
  return 'Image quality is low. Please take a photo in bright light with your palm held flat and straight.';
}
