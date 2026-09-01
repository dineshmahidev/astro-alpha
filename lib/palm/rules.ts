/**
 * PALMISTRY RULE ENGINE
 * ---------------------
 * Generates structured PalmIndicator objects from detected palm features.
 * Each indicator maps a detected feature to its traditional palmistry meaning.
 */

import { PalmLine, PalmIndicator, PalmPoint, PalmMetrics } from './types';

const dist = (a: PalmPoint, b: PalmPoint) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

/**
 * Generate palm indicators from detected lines and metrics.
 */
export function generateIndicators(
  lines: PalmLine[],
  metrics: PalmMetrics,
  pts: PalmPoint[],
): PalmIndicator[] {
  const indicators: PalmIndicator[] = [];

  // Life Line indicators
  const lifeLine = lines.find(l => l.name === 'Life Line');
  if (lifeLine) {
    indicators.push(...getLifeIndicators(lifeLine, metrics));
  }

  // Heart Line indicators
  const heartLine = lines.find(l => l.name === 'Heart Line');
  if (heartLine) {
    indicators.push(...getHeartIndicators(heartLine, metrics));
  }

  // Head Line indicators
  const headLine = lines.find(l => l.name === 'Head Line');
  if (headLine) {
    indicators.push(...getHeadIndicators(headLine, metrics));
  }

  // Fate Line indicators
  const fateLine = lines.find(l => l.name === 'Fate Line');
  if (fateLine) {
    indicators.push(...getFateIndicators(fateLine, metrics));
  }

  // Palm shape indicator
  indicators.push(getPalmShapeIndicator(metrics));

  // Communication indicator
  indicators.push(getCommunicationIndicator(metrics));

  return indicators;
}

function getLifeIndicators(line: PalmLine, metrics: PalmMetrics): PalmIndicator[] {
  const indicators: PalmIndicator[] = [];

  if (line.detected) {
    if (metrics.thumbSpan >= 1.15) {
      indicators.push({
        feature: 'Life Line Length',
        detectedValue: 'Strong and long',
        traditionalMeaning: 'Strong vitality, good physical stamina, robust health throughout life',
        confidence: line.confidence,
        evidence: ['Thumb span ratio high', line.description],
      });
    } else if (metrics.thumbSpan >= 0.95) {
      indicators.push({
        feature: 'Life Line Length',
        detectedValue: 'Steady and moderate',
        traditionalMeaning: 'Balanced energy levels, steady health, moderate constitution',
        confidence: line.confidence,
        evidence: ['Thumb span ratio moderate', line.description],
      });
    } else {
      indicators.push({
        feature: 'Life Line Length',
        detectedValue: 'Sensitive and refined',
        traditionalMeaning: 'Refined constitution, sensitive to environment, needs careful self-care',
        confidence: line.confidence,
        evidence: ['Thumb span ratio low', line.description],
      });
    }
  }

  return indicators;
}

function getHeartIndicators(line: PalmLine, metrics: PalmMetrics): PalmIndicator[] {
  const indicators: PalmIndicator[] = [];

  if (line.detected) {
    if (metrics.indexRingRatio < 0.93) {
      indicators.push({
        feature: 'Heart Line Pattern',
        detectedValue: 'Passionate',
        traditionalMeaning: 'Passionate nature, strong emotions, direct in relationships',
        confidence: line.confidence,
        evidence: ['Index-to-ring ratio low', line.description],
      });
    } else if (metrics.indexRingRatio > 1.0) {
      indicators.push({
        feature: 'Heart Line Pattern',
        detectedValue: 'Devoted',
        traditionalMeaning: 'Devoted and careful in love, values loyalty, cautious emotional expression',
        confidence: line.confidence,
        evidence: ['Index-to-ring ratio high', line.description],
      });
    } else {
      indicators.push({
        feature: 'Heart Line Pattern',
        detectedValue: 'Balanced',
        traditionalMeaning: 'Balanced emotional nature, diplomatic in relationships',
        confidence: line.confidence,
        evidence: ['Index-to-ring ratio balanced', line.description],
      });
    }
  }

  return indicators;
}

function getHeadIndicators(line: PalmLine, metrics: PalmMetrics): PalmIndicator[] {
  const indicators: PalmIndicator[] = [];

  if (line.detected) {
    if (metrics.focusRatio >= 0.93) {
      indicators.push({
        feature: 'Head Line Pattern',
        detectedValue: 'Analytical',
        traditionalMeaning: 'Strong analytical mind, detail-oriented, suited for research and technical fields',
        confidence: line.confidence,
        evidence: ['Focus ratio high', line.description],
      });
    } else if (metrics.focusRatio >= 0.86) {
      indicators.push({
        feature: 'Head Line Pattern',
        detectedValue: 'Practical',
        traditionalMeaning: 'Practical thinker, balanced between logic and intuition',
        confidence: line.confidence,
        evidence: ['Focus ratio moderate', line.description],
      });
    } else {
      indicators.push({
        feature: 'Head Line Pattern',
        detectedValue: 'Intuitive',
        traditionalMeaning: 'Intuitive and creative thinker, strong imagination, artistic inclination',
        confidence: line.confidence,
        evidence: ['Focus ratio low', line.description],
      });
    }
  }

  return indicators;
}

function getFateIndicators(line: PalmLine, metrics: PalmMetrics): PalmIndicator[] {
  const indicators: PalmIndicator[] = [];

  if (line.detected) {
    indicators.push({
      feature: 'Fate Line',
      detectedValue: 'Present',
      traditionalMeaning: 'Structured career path, clear life direction, external forces guiding career',
      confidence: line.confidence,
      evidence: [line.description],
    });
  } else {
    indicators.push({
      feature: 'Fate Line',
      detectedValue: 'Absent',
      traditionalMeaning: 'Self-made path, independent career, creates own destiny rather than following tradition',
      confidence: line.confidence,
      evidence: [line.description],
    });
  }

  return indicators;
}

function getPalmShapeIndicator(metrics: PalmMetrics): PalmIndicator {
  if (metrics.palmShape >= 0.88) {
    return {
      feature: 'Palm Shape',
      detectedValue: 'Earth hand (broad, square palm)',
      traditionalMeaning: 'Practical, reliable, hardworking. Suited for hands-on professions, agriculture, engineering, real estate',
      confidence: 0.7,
      evidence: [`Palm shape ratio: ${metrics.palmShape}`],
    };
  } else if (metrics.palmShape <= 0.76) {
    return {
      feature: 'Palm Shape',
      detectedValue: 'Air hand (long, rectangular palm)',
      traditionalMeaning: 'Intellectual, communicative, curious. Suited for writing, teaching, research, technology',
      confidence: 0.7,
      evidence: [`Palm shape ratio: ${metrics.palmShape}`],
    };
  } else {
    return {
      feature: 'Palm Shape',
      detectedValue: 'Mixed hand (balanced proportions)',
      traditionalMeaning: 'Versatile, adaptable, multi-talented. Suited for management, consulting, diverse careers',
      confidence: 0.7,
      evidence: [`Palm shape ratio: ${metrics.palmShape}`],
    };
  }
}

function getCommunicationIndicator(metrics: PalmMetrics): PalmIndicator {
  if (metrics.commRatio >= 0.62) {
    return {
      feature: 'Communication Style',
      detectedValue: 'Persuasive',
      traditionalMeaning: 'Strong persuasive ability, natural leader, good at influencing others',
      confidence: 0.65,
      evidence: [`Communication ratio: ${metrics.commRatio}`],
    };
  } else if (metrics.commRatio >= 0.55) {
    return {
      feature: 'Communication Style',
      detectedValue: 'Trusted',
      traditionalMeaning: 'Trusted communicator, good listener, balanced in conversations',
      confidence: 0.65,
      evidence: [`Communication ratio: ${metrics.commRatio}`],
    };
  } else {
    return {
      feature: 'Communication Style',
      detectedValue: 'Listener',
      traditionalMeaning: 'Deep listener, thoughtful responder, values quality over quantity in communication',
      confidence: 0.65,
      evidence: [`Communication ratio: ${metrics.commRatio}`],
    };
  }
}

/**
 * Calculate overall confidence from a set of indicators.
 */
export function calculateOverallConfidence(indicators: PalmIndicator[]): number {
  if (indicators.length === 0) return 0;
  const total = indicators.reduce((sum, ind) => sum + ind.confidence, 0);
  return Math.round((total / indicators.length) * 100) / 100;
}
