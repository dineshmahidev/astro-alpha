/**
 * PALM READING TYPES
 * ------------------
 * Structured types for the palm reading engine.
 * Follows MASTER_PROMPT Part 11-13 specifications.
 */

import type { AppLanguage } from '@/constants/i18n';

/** A detected palm line with confidence and properties */
export interface PalmLine {
  name: string;
  detected: boolean;
  confidence: number;
  description: string;
  continuity: 'continuous' | 'broken' | 'fragmented' | 'unknown';
  branches: number;
}

/** A palmistry indicator with traditional meaning */
export interface PalmIndicator {
  feature: string;
  detectedValue: string;
  traditionalMeaning: string;
  confidence: number;
  evidence: string[];
}

/** Image quality assessment */
export interface ImageQuality {
  score: number; // 0-1
  issues: string[];
  sufficient: boolean;
}

/** Reading for a single hand */
export interface HandReading {
  lines: PalmLine[];
  indicators: PalmIndicator[];
  traits: string[];
  summary: string;
  confidence: number;
  handType: 'left' | 'right';
}

/** Complete dual-hand palm reading */
export type PalmReading = {
  leftHand: HandReading | null;
  rightHand: HandReading | null;
  comparison: string | null;
  overallConfidence: number;
  lang: AppLanguage;
  // Legacy fields for backward compatibility
  lines: string[];
  summary: string;
  metrics: {
    indexRingRatio: number;
    palmShape: number;
    focusRatio: number;
    commRatio: number;
    thumbSpan: number;
  };
};

/** Legacy type alias for backward compatibility */
export type PalmMetrics = PalmReading['metrics'];

export type PalmPoint = { x: number; y: number };
