import type { MarriageReport } from './types';

/**
 * AI INTEGRATION
 * --------------
 * The AI receives ONLY this structured payload. It must never calculate.
 * The system rule below is enforced in the prompt itself.
 */

export const MARRIAGE_AI_SYSTEM_RULE = `You are an astrology interpretation assistant. Use ONLY the supplied calculated astrology data. Never calculate or invent planetary positions yourself. Never change the calculated Lagna, Rashi, Nakshatra, Dasha, house placements or transit positions. Explain the supplied results in natural language. Clearly distinguish:
- calculated astrological data (given to you)
- interpretation (your narration)
- uncertainty (confidence and windows)
Never claim scientific certainty.`;

export function buildMarriagePromptEn(report: MarriageReport): string {
  const w = report.marriageWindows;
  const lines = [
    MARRIAGE_AI_SYSTEM_RULE,
    '',
    '=== CALCULATED ASTROLOGY DATA (DO NOT MODIFY) ===',
    JSON.stringify(
      {
        birthData: report.birthData,
        lagna: `${report.chart.lagna.rashiNameEnglish} ${report.chart.lagna.dms.degrees}°${report.chart.lagna.dms.minutes}′`,
        moon: {
          rashi: report.chart.moon.rashi,
          nakshatra: report.chart.moon.nakshatra,
          pada: report.chart.moon.pada,
          house: report.chart.moon.house,
        },
        planets: Object.fromEntries(
          report.chart.planets.map((p) => [
            p.planet,
            { rashi: p.rashi, house: p.house, nakshatra: p.nakshatra, dignity: p.dignity },
          ]),
        ),
        seventhHouse: {
          sign: report.chart.seventhHouse.rashi,
          lord: report.chart.seventhHouse.lord,
          occupants: report.chart.seventhHouse.planets,
        },
        dasha: {
          currentMahadasha: `${report.dasha.currentMaha.lord} (${report.dasha.currentMaha.startISO} → ${report.dasha.currentMaha.endISO})`,
          currentAntardasha: `${report.dasha.currentAntar.lord} (${report.dasha.currentAntar.startISO} → ${report.dasha.currentAntar.endISO})`,
        },
        navamsa: {
          venusNote: report.navamsa.venusNavamsaStrengthNote,
          venusD9: report.navamsa.planets.find((p) => p.planet === 'Venus'),
        },
        marriageIndicators: report.marriageIndicators,
        relationshipIndicators: report.relationshipIndicators,
        loveVsArranged: report.loveVsArranged,
        delayAssessment: report.delayAssessment,
        marriageWindows: {
          primary: w.primary && { label: w.primary.label, score: w.primary.score, reasons: w.primary.reasons.slice(0, 5) },
          secondary: w.secondary && { label: w.secondary.label, score: w.secondary.score },
          supporting: w.supporting.map((x) => ({ label: x.label, score: x.score })),
          yearlyScores: w.yearlyScores,
        },
        confidence: report.confidence,
      },
      null,
      1,
    ),
    '',
    '=== REQUESTED OUTPUT FORMAT ===',
    'Marriage Timing',
    `Primary Window: ${w.primary?.label ?? 'calculated above'}`,
    `Strongest Period: ${w.primary?.label ?? 'n/a'}`,
    `Marriage Potential: High/Moderate/Low (derive from scores)`,
    `Relationship Before Marriage: ${report.relationshipIndicators.relationshipStrength}`,
    `Marriage Pattern: ${report.loveVsArranged.classification}`,
    `Reason: explain the actual calculated indicators listed above.`,
    'Respond naturally; never invent new planetary data.',
  ];
  return lines.join('\n');
}

export function buildMarriagePromptTa(report: MarriageReport): string {
  const w = report.marriageWindows;
  return [
    MARRIAGE_AI_SYSTEM_RULE,
    '',
    'கீழ்க்காணும் கணக்கிடப்பட்ட ஜோதிட தரவை மட்டும் பயன்படுத்தி, இயற்கையான தமிழில் விளக்குங்கள்:',
    JSON.stringify(
      {
        lagna: report.chart.lagna.rashiNameEnglish,
        rasi: report.chart.moon.rashi,
        natchathiram: report.chart.moon.nakshatra,
        currentDasha: `${report.dasha.currentMaha.lord} - ${report.dasha.currentAntar.lord}`,
        poruthamScore: report.marriageIndicators.baseTotal,
        marriageWindows: w.primary?.label,
        vayppu: report.marriageIndicators.baseTotal >= 60 ? 'அதிகம்' : 'மிதமானது',
      },
      null,
      1,
    ),
    '',
    'தேவையான வெளியீடு:',
    `திருமணத்திற்கான முக்கிய காலம்: ${w.primary?.label ?? '-'}`,
    `வலுவான காலப்பகுதி: ${w.primary?.label ?? '-'}`,
    'திருமண வாய்ப்பு: (score-ஐ அடிப்படையாகக் கொண்டு)',
    `திருமணத்திற்கு முன் relationship: ${report.relationshipIndicators.relationshipStrength}`,
    `திருமண முறை: ${report.loveVsArranged.classification}`,
    `காரணம்: மேலே உள்ள calculated chart indicators-ஐ மட்டும் explain செய்யுங்கள்.`,
    'புதிய கிரக நிலைகளை உருவாக்க வேண்டாம்.',
  ].join('\n');
}
