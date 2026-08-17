export type AISpecialist = {
  id: string;
  name: string;
  tagline: string;
  avatar: any;
  icon: string;
  report: string[];
};

export const AI_SPECIALISTS: AISpecialist[] = [
  {
    id: 'health',
    name: 'Health Advisor',
    tagline: 'Astro health tips & remedies',
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
    name: 'Wealth Guru',
    tagline: 'Money, career & investments',
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
    name: 'Marriage Match',
    tagline: 'Love, compatibility & timing',
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
    id: 'specialist',
    name: 'Specialist',
    tagline: 'Deep dive into your chart',
    avatar: require('@/assets/images/ai-chat/Astrologer_holding_mystical_astr__202608170131.jpeg'),
    icon: 'medkit',
    report: [
      'Your Lagna lord Sun gives a strong, self-driven personality.',
      'Rahu in the 8th house fuels curiosity for hidden knowledge.',
      'A balanced daily routine unlocks your full potential.',
      'Focus on one clear goal to channel planetary energy.',
    ],
  },
  {
    id: 'career',
    name: 'Career Coach',
    tagline: 'Job, growth & promotions',
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
    tagline: 'Studies, exams & focus',
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
    id: 'business',
    name: 'Business Advisor',
    tagline: 'Venture, deals & success',
    avatar: require('@/assets/images/ai-chat/Alchemist_holding_glowing_vial_202608170131.jpeg'),
    icon: 'storefront',
    report: [
      'Mars in the 11th house favors bold business moves.',
      'Partner decisions go well under Jupiter\'s grace.',
      'Avoid overextending credit during this Mercury phase.',
      'Patient planning today yields steady returns.',
    ],
  },
  {
    id: 'family',
    name: 'Family Astrologer',
    tagline: 'Home, peace & bonds',
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
    id: 'love',
    name: 'Love Expert',
    tagline: 'Relationships & emotions',
    avatar: require('@/assets/images/ai-chat/Woman_holding_glowing_mystical_h__202608170131.jpeg'),
    icon: 'heart-half',
    report: [
      'Venus softens conflicts and opens hearts today.',
      'Express feelings honestly for a deeper connection.',
      'A romantic gesture will be warmly received.',
      'Trust builds through small consistent acts of care.',
    ],
  },
  {
    id: 'remedies',
    name: 'Remedies Guide',
    tagline: 'Mantras, gems & rituals',
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
  AI_SPECIALISTS.find((s) => s.id === id) ?? AI_SPECIALISTS[0];