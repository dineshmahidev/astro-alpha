/**
 * PALM LINE DETECTION
 * -------------------
 * Generates structured PalmLine objects from MediaPipe hand landmarks.
 * Uses geometric heuristics based on traditional palmistry positions.
 */

import { PalmLine, PalmPoint } from './types';

const dist = (a: PalmPoint, b: PalmPoint) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Detect palm lines from 21 MediaPipe hand landmarks.
 * Returns structured PalmLine objects with confidence scores.
 */
export function detectPalmLines(pts: PalmPoint[]): PalmLine[] {
  if (!pts || pts.length !== 21) {
    return getDefaultLines();
  }

  const lines: PalmLine[] = [];

  // Life Line — curves from between thumb and index finger down toward wrist
  lines.push(detectLifeLine(pts));
  // Heart Line — runs across the top of the palm under the fingers
  lines.push(detectHeartLine(pts));
  // Head Line — runs across the middle of the palm
  lines.push(detectHeadLine(pts));
  // Fate Line — runs vertically up the center (not always present)
  lines.push(detectFateLine(pts));
  // Sun Line — runs vertically under the ring finger (not always present)
  lines.push(detectSunLine(pts));
  // Marriage Lines — small lines on the edge under the pinky
  lines.push(detectMarriageLine(pts));

  return lines;
}

function detectLifeLine(pts: PalmPoint[]): PalmLine {
  // Life line curves from between thumb (4) and index (8) down to wrist (0)
  const startDist = dist(pts[4], pts[8]);
  const length = dist(pts[8], pts[0]);
  const palmLen = dist(pts[0], pts[9]);
  const normalizedLength = length / palmLen;

  // Check curvature by measuring midpoint distance from line connecting start-end
  const midX = (pts[8].x + pts[0].x) / 2;
  const midY = (pts[8].y + pts[0].y) / 2;
  const curvature = Math.abs(midX - (pts[4].x + pts[8].x) / 2);

  const detected = normalizedLength > 0.3;
  const confidence = detected ? Math.min(0.9, 0.5 + normalizedLength * 0.4) : 0.2;
  const continuity: PalmLine['continuity'] = curvature > 0.05 ? 'continuous' : 'continuous';

  return {
    name: 'Life Line',
    detected,
    confidence,
    description: detected
      ? `Life line length: ${normalizedLength > 0.6 ? 'long' : normalizedLength > 0.4 ? 'medium' : 'short'}, curvature: ${curvature > 0.08 ? 'pronounced' : 'gentle'}`
      : 'Life line not clearly visible',
    continuity,
    branches: curvature > 0.1 ? 2 : 0,
  };
}

function detectHeartLine(pts: PalmPoint[]): PalmLine {
  // Heart line runs from index finger area (8) toward pinky (20)
  const length = dist(pts[8], pts[20]);
  const palmWidth = dist(pts[5], pts[17]);
  const normalizedLength = length / palmWidth;

  // Height under fingers indicates emotional style
  const height = Math.abs(pts[8].y - pts[20].y);
  const isEmotional = height < 0.02; // nearly straight = balanced

  const detected = normalizedLength > 0.5;
  const confidence = detected ? Math.min(0.85, 0.5 + normalizedLength * 0.35) : 0.15;

  return {
    name: 'Heart Line',
    detected,
    confidence,
    description: detected
      ? `Heart line ${normalizedLength > 0.8 ? 'extends fully' : 'partially visible'} across palm — ${isEmotional ? 'balanced emotional nature' : 'passionate nature'}`
      : 'Heart line not clearly visible',
    continuity: 'continuous',
    branches: 0,
  };
}

function detectHeadLine(pts: PalmPoint[]): PalmLine {
  // Head line runs from index finger area toward center/pinky side
  const length = dist(pts[8], pts[17]);
  const palmWidth = dist(pts[5], pts[17]);
  const normalizedLength = length / palmWidth;

  // Slope indicates analytical vs intuitive thinking
  const slope = Math.abs(pts[8].y - pts[17].y);
  const isAnalytical = slope < 0.03;

  const detected = normalizedLength > 0.4;
  const confidence = detected ? Math.min(0.8, 0.4 + normalizedLength * 0.4) : 0.1;

  return {
    name: 'Head Line',
    detected,
    confidence,
    description: detected
      ? `Head line ${normalizedLength > 0.7 ? 'long and well-defined' : 'shorter'} — ${isAnalytical ? 'analytical thinking' : 'intuitive approach'}`
      : 'Head line not clearly visible',
    continuity: 'continuous',
    branches: 0,
  };
}

function detectFateLine(pts: PalmPoint[]): PalmLine {
  // Fate line runs vertically from wrist (0) toward middle finger (12)
  // Not everyone has a clear fate line
  const length = dist(pts[0], pts[12]);
  const palmLen = dist(pts[0], pts[9]);
  const normalizedLength = length / palmLen;

  // Check if there's a vertical path in the center
  const centerX = (pts[9].x + pts[12].x) / 2;
  const centerDeviation = Math.abs(pts[0].x - centerX);

  const detected = normalizedLength > 0.5 && centerDeviation < 0.1;
  const confidence = detected ? 0.5 : 0.1;

  return {
    name: 'Fate Line',
    detected,
    confidence,
    description: detected
      ? 'Fate line present — indicates structured career path'
      : 'Fate line not visible — indicates self-made path',
    continuity: detected ? 'continuous' : 'unknown',
    branches: 0,
  };
}

function detectSunLine(pts: PalmPoint[]): PalmLine {
  // Sun line runs vertically under the ring finger (16)
  // Not always present
  const length = dist(pts[0], pts[16]);
  const palmLen = dist(pts[0], pts[9]);
  const normalizedLength = length / palmLen;

  const detected = normalizedLength > 0.6;
  const confidence = detected ? 0.4 : 0.1;

  return {
    name: 'Sun Line',
    detected,
    confidence,
    description: detected
      ? 'Sun line visible — indicates artistic talent and recognition'
      : 'Sun line not visible',
    continuity: 'unknown',
    branches: 0,
  };
}

function detectMarriageLine(pts: PalmPoint[]): PalmLine {
  // Marriage lines are small lines on the edge under the pinky (20)
  // We estimate based on the edge definition
  const edgeDefinition = dist(pts[17], pts[20]);
  const pinkyLength = dist(pts[20], pts[17]);
  const edgeRatio = edgeDefinition / pinkyLength;

  const detected = edgeRatio > 0.8;
  const confidence = detected ? 0.35 : 0.1;

  return {
    name: 'Marriage Line',
    detected,
    confidence,
    description: detected
      ? 'Marriage line area shows definition — relationships are significant'
      : 'Marriage lines not clearly distinguishable',
    continuity: 'unknown',
    branches: 0,
  };
}

function getDefaultLines(): PalmLine[] {
  return [
    { name: 'Life Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
    { name: 'Heart Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
    { name: 'Head Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
    { name: 'Fate Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
    { name: 'Sun Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
    { name: 'Marriage Line', detected: false, confidence: 0, description: 'Unable to detect', continuity: 'unknown', branches: 0 },
  ];
}
