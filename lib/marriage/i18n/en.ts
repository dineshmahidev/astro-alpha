/** English display names. Calculation NEVER depends on these. */
export const EN = {
  rashis: [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ],
  nakshatras: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
  ],
  labels: {
    lagna: 'Lagna (Ascendant)',
    moonSign: 'Moon Sign',
    birthStar: 'Birth Star',
    marriageTiming: 'Marriage Timing',
    primaryWindow: 'Primary Window',
    secondaryWindow: 'Secondary Window',
    supportingPeriod: 'Supporting Period',
    strongestPeriod: 'Strongest Period',
    marriagePotential: 'Marriage Potential',
    relationshipBeforeMarriage: 'Relationship Before Marriage',
    marriagePattern: 'Marriage Pattern',
    reason: 'Reason',
    confidence: 'Confidence',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    delayNote: 'Delay Indicators',
  },
  potentialBands: {
    veryHigh: 'Very High',
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
  },
} as const;

export function potentialBand(score: number): string {
  if (score >= 75) return EN.potentialBands.veryHigh;
  if (score >= 60) return EN.potentialBands.high;
  if (score >= 45) return EN.potentialBands.moderate;
  return EN.potentialBands.low;
}
