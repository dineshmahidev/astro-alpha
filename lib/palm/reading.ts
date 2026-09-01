/**
 * OFFLINE PALM READING ENGINE
 * ---------------------------
 * Deterministic interpretation of hand GEOMETRY from the 21 MediaPipe
 * hand landmarks detected on-device by assets/hand_landmarker.task.
 * No randomness, no network. Same hand -> same reading.
 *
 * Supports EN / TA / HI via uiStrings keys.
 */

import type { AppLanguage } from '@/constants/i18n';
import { uiStrings } from '@/constants/ui-strings';
import { detectPalmLines } from './line-detection';
import { generateIndicators, calculateOverallConfidence } from './rules';
import type { PalmLine, PalmIndicator, HandReading, PalmPoint as StructuredPalmPoint } from './types';

export type PalmPoint = { x: number; y: number };

export type PalmMetrics = {
  indexRingRatio: number;
  palmShape: number;
  focusRatio: number;
  commRatio: number;
  thumbSpan: number;
};

export type PalmReading = {
  lines: string[];
  traits: string[];
  summary: string;
  metrics: PalmMetrics;
  lang: AppLanguage;
};

const dist = (a: PalmPoint, b: PalmPoint) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

function safeDiv(a: number, b: number) {
  return b === 0 ? 1 : a / b;
}

const SUMMARY_EN = (shape: string, temper: string, life: string, heart: string, head: string, fate: string, comm: string, best: string) =>
  `You have a ${shape}. Temperament reads ${temper}, with ${life}, a ${heart} and a ${head}. Career pattern: ${fate}. Communication: ${comm}. Best alignment: ${best}.`;

const SUMMARY_TA = (shape: string, temper: string, life: string, heart: string, head: string, fate: string, comm: string, best: string) =>
  `உங்களிடம் ${shape} உள்ளது. குணநலம் ${temper}, ${life}, ${heart} மற்றும் ${head}. தொழில்: ${fate}. தொடர்பு: ${comm}. சிறந்த பொருத்தம்: ${best}.`;

const SUMMARY_HI = (shape: string, temper: string, life: string, heart: string, head: string, fate: string, comm: string, best: string) =>
  `आपके पास ${shape} है। स्वभाव ${temper}, ${life}, ${heart} और ${head}। करियर: ${fate}। संवाद: ${comm}। सर्वोत्तम: ${best}.`;

export function generatePalmReading(pts: PalmPoint[], lang: AppLanguage = 'en'): PalmReading | null {
  if (!pts || pts.length !== 21) return null;

  const t = uiStrings(lang);

  // ---- raw measurements
  const palmLen = dist(pts[0], pts[9]);
  const palmWidth = dist(pts[5], pts[17]);
  const indexLen = dist(pts[8], pts[5]);
  const middleLen = dist(pts[12], pts[9]);
  const ringLen = dist(pts[16], pts[13]);
  const pinkyLen = dist(pts[20], pts[17]);
  const thumbTipSpan = dist(pts[4], pts[13]);

  if (palmLen <= 0 || palmWidth <= 0) return null;

  // ---- normalized metrics
  const indexRingRatio = safeDiv(indexLen, ringLen);
  const palmShape = safeDiv(palmWidth, palmLen);
  const focusRatio = safeDiv(middleLen, palmLen);
  const commRatio = safeDiv(pinkyLen, ringLen);
  const thumbSpan = safeDiv(thumbTipSpan, palmWidth);

  const clamp01to2 = (v: number) => Math.max(0, Math.min(2, v));

  // ---- LIFE LINE
  let lifeLineKey: string;
  let lifeTraitKey: string;
  if (thumbSpan >= 1.15 && palmShape >= 0.82) {
    lifeLineKey = 'palm.life.strong';
    lifeTraitKey = 'palm.trait.stamina';
  } else if (thumbSpan >= 0.95) {
    lifeLineKey = 'palm.life.steady';
    lifeTraitKey = 'palm.trait.energy';
  } else {
    lifeLineKey = 'palm.life.sensitive';
    lifeTraitKey = 'palm.trait.sensitive';
  }

  // ---- HEART LINE
  let heartLineKey: string;
  let heartTraitKey: string;
  if (indexRingRatio < 0.93) {
    heartLineKey = 'palm.heart.passionate';
    heartTraitKey = 'palm.trait.passionate';
  } else if (indexRingRatio > 1.0) {
    heartLineKey = 'palm.heart.devoted';
    heartTraitKey = 'palm.trait.devoted';
  } else {
    heartLineKey = 'palm.heart.balanced';
    heartTraitKey = 'palm.trait.balanced';
  }

  // ---- HEAD LINE
  let headLineKey: string;
  let headTraitKey: string;
  if (focusRatio >= 0.93) {
    headLineKey = 'palm.head.analytical';
    headTraitKey = 'palm.trait.analytical';
  } else if (focusRatio >= 0.86) {
    headLineKey = 'palm.head.practical';
    headTraitKey = 'palm.trait.practical';
  } else {
    headLineKey = 'palm.head.intuitive';
    headTraitKey = 'palm.trait.intuitive';
  }

  // ---- FATE LINE
  let fateLineKey: string;
  let fateTraitKey: string;
  if (palmShape >= 0.88) {
    fateLineKey = 'palm.fate.craft';
    fateTraitKey = 'palm.trait.craft';
  } else if (palmShape <= 0.76) {
    fateLineKey = 'palm.fate.creative';
    fateTraitKey = 'palm.trait.creative';
  } else {
    fateLineKey = 'palm.fate.leader';
    fateTraitKey = 'palm.trait.leader';
  }

  // ---- COMMUNICATION
  let commLineKey: string;
  let commTraitKey: string;
  if (commRatio >= 0.62) {
    commLineKey = 'palm.comm.persuasive';
    commTraitKey = 'palm.trait.persuasive';
  } else if (commRatio >= 0.55) {
    commLineKey = 'palm.comm.trusted';
    commTraitKey = 'palm.trait.trusted';
  } else {
    commLineKey = 'palm.comm.listener';
    commTraitKey = 'palm.trait.listener';
  }

  // ---- SUMMARY (language-aware)
  const shapeName =
    lang === 'ta'
      ? palmShape >= 0.88 ? 'அகலமான நடைமுறை கை' : palmShape <= 0.76 ? 'நீளமான கலை கை' : 'சமநிலை கலவை கை'
      : lang === 'hi'
        ? palmShape >= 0.88 ? 'चौड़ी व्यावहारिक हथेली' : palmShape <= 0.76 ? 'लंबी कलात्मक हथेली' : 'संतुलित मिश्रित हथेली'
        : palmShape >= 0.88 ? 'broad practical hand' : palmShape <= 0.76 ? 'long artistic hand' : 'balanced mixed hand';

  const temper =
    lang === 'ta'
      ? indexRingRatio < 0.93 ? 'தைரியமான போட்டி' : indexRingRatio > 1.0 ? 'நம்பிக்கையுள்ள கவனம்' : 'நெகிழ்வான சமநிலை'
      : lang === 'hi'
        ? indexRingRatio < 0.93 ? 'साहसी और प्रतिस्पर्धी' : indexRingRatio > 1.0 ? 'आत्मविश्वासी और सावधान' : 'अनुकूलनशील और संतुलित'
        : indexRingRatio < 0.93 ? 'bold and competitive' : indexRingRatio > 1.0 ? 'confident and careful' : 'adaptable and diplomatic';

  const best =
    lang === 'ta'
      ? focusRatio >= 0.93 ? 'ஒழுங்குமுறை தொழில்கள் — பொறியியல், நிதி, ஆராய்ச்சி' : palmShape <= 0.76 ? 'படைப்பு தொழில்கள் — வடிவமைப்பு, கலை, ஆலோசனை' : 'மக்கள் முகம் தொழில்கள் — மேலாண்மை, கற்பித்தல், வணிகம்'
      : lang === 'hi'
        ? focusRatio >= 0.93 ? 'व्यवस्थित पेशे — इंजीनियरिंग, वित्त, अनुसंधान' : palmShape <= 0.76 ? 'रचनात्मक पेशे — डिज़ाइन, कला, परामर्श' : 'लोगों से जुड़े पेशे — प्रबंधन, शिक्षण, व्यापार'
        : focusRatio >= 0.93 ? 'structured professions — engineering, finance, research' : palmShape <= 0.76 ? 'creative professions — design, arts, counselling' : 'people-facing professions — management, teaching, business';

  const summaryFn = lang === 'ta' ? SUMMARY_TA : lang === 'hi' ? SUMMARY_HI : SUMMARY_EN;
  const summary = summaryFn(shapeName, temper, t[lifeTraitKey], t[heartTraitKey], t[headTraitKey], t[fateTraitKey], t[commTraitKey], best);

  return {
    lines: [t[lifeLineKey], t[heartLineKey], t[headLineKey], t[fateLineKey], t[commLineKey]],
    traits: [t[lifeTraitKey], t[heartTraitKey], t[headTraitKey], t[fateTraitKey], t[commTraitKey]],
    summary,
    lang,
    metrics: {
      indexRingRatio: Math.round(clamp01to2(indexRingRatio) * 1000) / 1000,
      palmShape: Math.round(clamp01to2(palmShape) * 1000) / 1000,
      focusRatio: Math.round(clamp01to2(focusRatio) * 1000) / 1000,
      commRatio: Math.round(clamp01to2(commRatio) * 1000) / 1000,
      thumbSpan: Math.round(clamp01to2(thumbSpan) * 1000) / 1000,
    },
  };
}

/**
 * Generate an enhanced hand reading with structured PalmLine and PalmIndicator data.
 * This follows the MASTER_PROMPT specification for palmistry.
 */
export function generateEnhancedReading(
  pts: PalmPoint[],
  handType: 'left' | 'right',
  lang: AppLanguage = 'en',
): HandReading | null {
  const basic = generatePalmReading(pts, lang);
  if (!basic) return null;

  const structuredPts: StructuredPalmPoint[] = pts.map(p => ({ x: p.x, y: p.y }));
  const lines = detectPalmLines(structuredPts);
  const indicators = generateIndicators(lines, basic.metrics, structuredPts);
  const confidence = calculateOverallConfidence(indicators);

  return {
    lines,
    indicators,
    traits: basic.traits,
    summary: basic.summary,
    confidence,
    handType,
  };
}
