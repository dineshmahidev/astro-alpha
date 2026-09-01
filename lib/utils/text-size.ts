/**
 * LANGUAGE-AWARE TEXT SIZES
 * -------------------------
 * Tamil and Hindi characters are wider/taller than English.
 * This utility scales font sizes down for non-Latin scripts
 * so text fits properly on screen.
 */

import type { AppLanguage } from '@/constants/i18n';

const SCALE: Record<AppLanguage, number> = {
  en: 1.0,
  ta: 0.80,  // Tamil chars are wider — reduced more for better fit
  hi: 0.88,  // Devanagari ~12% taller
};

export function fs(lang: AppLanguage, size: number): number {
  return Math.round(size * SCALE[lang]);
}

/** Line height multiplier: Tamil needs slightly more leading */
export function lh(lang: AppLanguage, size: number): number {
  const base = size * 1.35;
  return Math.round(base * (lang === 'en' ? 1.0 : 1.08));
}
