/** Tamil display names. Calculation NEVER depends on these. */
export const TA = {
  rashis: [
    'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
    'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
  ],
  nakshatras: [
    'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை',
    'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
    'ஹஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
    'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
    'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி',
  ],
  labels: {
    lagna: 'லக்னம்',
    moonSign: 'ராசி',
    birthStar: 'ஜனநட்சத்திரம்',
    marriageTiming: 'திருமண காலம்',
    primaryWindow: 'முதன்மை காலம்',
    secondaryWindow: 'இரண்டாம் காலம்',
    supportingPeriod: 'துணை காலம்',
    strongestPeriod: 'வலுவான காலப்பகுதி',
    marriagePotential: 'திருமண வாய்ப்பு',
    relationshipBeforeMarriage: 'திருமணத்திற்கு முன் relationship',
    marriagePattern: 'திருமண முறை',
    reason: 'காரணம்',
    confidence: 'நம்பிக்கை',
    high: 'அதிகம்',
    moderate: 'மிதமானது',
    low: 'குறைவு',
    delayNote: 'தாமத காரணிகள்',
  },
  potentialBands: {
    veryHigh: 'மிக அதிகம்',
    high: 'அதிகம்',
    moderate: 'மிதமானது',
    low: 'குறைவு',
  },
} as const;

export function potentialBandTa(score: number): string {
  if (score >= 75) return TA.potentialBands.veryHigh;
  if (score >= 60) return TA.potentialBands.high;
  if (score >= 45) return TA.potentialBands.moderate;
  return TA.potentialBands.low;
}
