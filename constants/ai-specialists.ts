export type AISpecialist = {
  id: string;
  name: string;
  nameTa: string;
  nameHi: string;
  tagline: string;
  taglineTa: string;
  taglineHi: string;
  avatar: any;
  icon: string;
  report: string[];
};

export function getLocalizedName(spec: AISpecialist, language: string): string {
  if (language === 'ta') return spec.nameTa;
  if (language === 'hi') return spec.nameHi;
  return spec.name;
}

export function getLocalizedTagline(spec: AISpecialist, language: string): string {
  if (language === 'ta') return spec.taglineTa;
  if (language === 'hi') return spec.taglineHi;
  return spec.tagline;
}

export const AI_SPECIALISTS: AISpecialist[] = [
  {
    id: 'health',
    name: 'Health Advisor',
    nameTa: 'சுகாதார ஆலோசகர்',
    nameHi: 'स्वास्थ्य सलाहकार',
    tagline: 'Astro health tips & remedies',
    taglineTa: 'ஜோதிட சுகாதார குறிப்புகள்',
    taglineHi: 'ज्योतिष स्वास्थ्य सुझाव',
    avatar: require('@/assets/images/ai-chat/Female_healer_holding_mystical_s__202608170131.jpeg'),
    icon: 'heart',
    report: [
      'Your Leo Sun boosts heart health, but pace yourself and avoid overexertion.',
      'Moon in Scorpio favors hydration and calming bedtime routines.',
      'Include leafy greens to balance Mars energy in your 5th house.',
      'Regular morning sunlight strengthens your vitality today.',
    ],
  },
  {
    id: 'wealth',
    name: 'Wealth & Business',
    nameTa: 'செல்வம் & வணிகம்',
    nameHi: 'धन और व्यापार',
    tagline: 'Money, career, investments & business',
    taglineTa: 'பணம், தொழில், முதலீடு & வணிகம்',
    taglineHi: 'पैसा, करियर, निवेश और व्यापार',
    avatar: require('@/assets/images/ai-chat/Wealth_mystic_holding_golden_pen__202608170131.jpeg'),
    icon: 'cash',
    report: [
      'Jupiter in the 9th house brings gains through education and guidance.',
      'A favorable Mercury period supports negotiations and contracts.',
      'Consider long-term savings over impulsive spending this week.',
      'Saturn rewards patience — steady effort grows your wealth.',
    ],
  },
  {
    id: 'marriage',
    name: 'Marriage & Love',
    nameTa: 'திருமணம் & காதல்',
    nameHi: 'विवाह और प्रेम',
    tagline: 'Love, compatibility & timing',
    taglineTa: 'காதல், பொருத்தம் & நேரம்',
    taglineHi: 'प्रेम, संगतता और समय',
    avatar: require('@/assets/images/ai-chat/Gothic_oracle_holding_glowing_rings_202608170131.jpeg'),
    icon: 'people',
    report: [
      'Venus in the 7th house promises harmony in close relationships.',
      'Open, honest communication strengthens your bond today.',
      'A good window for proposals arrives near the new moon.',
      'Patience with differences deepens lasting compatibility.',
    ],
  },
  {
    id: 'career',
    name: 'Career Coach',
    nameTa: 'தொழில் வழிகாட்டி',
    nameHi: 'करियर कोच',
    tagline: 'Job, growth & promotions',
    taglineTa: 'வேலை, வளர்ச்சி & பதவி உயர்வு',
    taglineHi: 'नौकरी, विकास और पदोन्नति',
    avatar: require('@/assets/images/ai-chat/King_holding_golden_staff_202608170131.jpeg'),
    icon: 'briefcase',
    report: [
      'Mercury in the 10th house favors clear communication at work.',
      'A steady Saturn period rewards discipline and consistency.',
      'Networking opens a promising opportunity this month.',
      'Align your skills with your chart for faster growth.',
    ],
  },
  {
    id: 'education',
    name: 'Education Guide',
    nameTa: 'கல்வி வழிகாட்டி',
    nameHi: 'शिक्षा गाइड',
    tagline: 'Studies, exams & focus',
    taglineTa: 'படிப்பு, தேர்வு & கவனம்',
    taglineHi: 'पढ़ाई, परीक्षा और ध्यान',
    avatar: require('@/assets/images/ai-chat/Gothic_scholar_holding_ancient_book_202608170131.jpeg'),
    icon: 'school',
    report: [
      'Jupiter supports learning and higher knowledge now.',
      'A structured study plan will give the best results.',
      'Venus brings creativity to your studies this week.',
      'Morning revision aligns with your lunar rhythm.',
    ],
  },
  {
    id: 'family',
    name: 'Family Astrologer',
    nameTa: 'குடும்ப ஜோதிடர்',
    nameHi: 'पारिवारिक ज्योतिषी',
    tagline: 'Home, peace & bonds',
    taglineTa: 'வீடு, அமைதி & பிணைப்புகள்',
    taglineHi: 'घर, शांति और रिश्ते',
    avatar: require('@/assets/images/ai-chat/Gothic_woman_holding_family_symbol_202608170131.jpeg'),
    icon: 'home',
    report: [
      'Moon in the 4th house strengthens family harmony.',
      'A gentle conversation heals an old misunderstanding.',
      'Invite loved ones for a calm evening together.',
      'Home rituals bring peace during this lunar phase.',
    ],
  },
  {
    id: 'remedies',
    name: 'Remedies Guide',
    nameTa: 'பரிகார வழிகாட்டி',
    nameHi: 'उपाय गाइड',
    tagline: 'Mantras, gems & rituals',
    taglineTa: 'மந்திரங்கள், ரத்தினங்கள் & சடங்குகள்',
    taglineHi: 'मंत्र, रत्न और अनुष्ठान',
    avatar: require('@/assets/images/ai-chat/Gothic_AI_oracle_holding_book_202608170131.jpeg'),
    icon: 'diamond',
    report: [
      'Wearing a Sun-affirming stone balances your Leo energy.',
      'A simple morning mantra strengthens your focus.',
      'Donate consciously to clear karmic blocks.',
      'Consistent remedies multiply their effect over time.',
    ],
  },
];

export const getAISpecialist = (id: string) =>
  AI_SPECIALISTS.find((s) => s.id === id);
