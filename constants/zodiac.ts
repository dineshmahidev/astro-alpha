export type ZodiacSign = {
  emoji: string;
  name: string;
  id: string;
  image: any;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { emoji: '♈', name: 'Aries', id: 'aries', image: require('@/assets/images/aries.png') },
  { emoji: '♉', name: 'Taurus', id: 'taurus', image: require('@/assets/images/taurus.png') },
  { emoji: '♊', name: 'Gemini', id: 'gemini', image: require('@/assets/images/gemini.png') },
  { emoji: '♋', name: 'Cancer', id: 'cancer', image: require('@/assets/images/cancer.png') },
  { emoji: '♌', name: 'Leo', id: 'leo', image: require('@/assets/images/leo.png') },
  { emoji: '♍', name: 'Virgo', id: 'virgo', image: require('@/assets/images/virgo.png') },
  { emoji: '♎', name: 'Libra', id: 'libra', image: require('@/assets/images/libra.png') },
  { emoji: '♏', name: 'Scorpio', id: 'scorpio', image: require('@/assets/images/scorpio.png') },
  { emoji: '♐', name: 'Sagittarius', id: 'sagittarius', image: require('@/assets/images/sagittarius.png') },
  { emoji: '♑', name: 'Capricorn', id: 'capricorn', image: require('@/assets/images/capricorn.png') },
  { emoji: '♒', name: 'Aquarius', id: 'aquarius', image: require('@/assets/images/aquarius.png') },
  { emoji: '♓', name: 'Pisces', id: 'pisces', image: require('@/assets/images/pisces.png') },
];

export function getZodiacSign(id: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.id === id);
}
