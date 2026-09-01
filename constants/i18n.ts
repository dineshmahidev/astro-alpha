export type AppLanguage = 'en' | 'ta' | 'hi';

export const LANGUAGES: { id: AppLanguage; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export const RASHI_NAMES: Record<AppLanguage, string[]> = {
  en: [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ],
  ta: [
    'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
    'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
  ],
  hi: [
    'मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या',
    'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन',
  ],
};

export const NAKSHATRA_NAMES: Record<AppLanguage, string[]> = {
  en: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
    'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
    'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati',
  ],
  ta: [
    'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை',
    'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்',
    'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்',
    'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்',
    'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி',
    'உத்திரட்டாதி', 'ரேவதி',
  ],
  hi: [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
    'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्व फाल्गुनी',
    'उत्तर फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा',
    'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा',
    'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपद',
    'उत्तर भाद्रपद', 'रेवती',
  ],
};

export const PADA_LABELS: Record<AppLanguage, string> = {
  en: 'Pada',
  ta: 'பாதம்',
  hi: 'चरण',
};

export const NAKSHATRA_LABELS: Record<AppLanguage, string> = {
  en: 'Nakshatra',
  ta: 'நட்சத்திரம்',
  hi: 'नक्षत्र',
};

export const RASHI_LABELS: Record<AppLanguage, string> = {
  en: 'Rashi',
  ta: 'ராசி',
  hi: 'राशि',
};

export function getRashiName(lang: AppLanguage, index: number): string {
  return RASHI_NAMES[lang][index % 12];
}

export function getNakshatraName(lang: AppLanguage, index: number): string {
  return NAKSHATRA_NAMES[lang][index % 27];
}