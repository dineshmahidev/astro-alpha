export type ZodiacSign = {
  emoji: string;
  name: string;
  id: string;
  image: any;
};

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { emoji: '♈', name: 'Aries', id: 'aries', image: require('@/assets/images/aries.webp') },
  { emoji: '♉', name: 'Taurus', id: 'taurus', image: require('@/assets/images/taurus.webp') },
  { emoji: '♊', name: 'Gemini', id: 'gemini', image: require('@/assets/images/gemini.webp') },
  { emoji: '♋', name: 'Cancer', id: 'cancer', image: require('@/assets/images/cancer.webp') },
  { emoji: '♌', name: 'Leo', id: 'leo', image: require('@/assets/images/leo.webp') },
  { emoji: '♍', name: 'Virgo', id: 'virgo', image: require('@/assets/images/virgo.webp') },
  { emoji: '♎', name: 'Libra', id: 'libra', image: require('@/assets/images/libra.webp') },
  { emoji: '♏', name: 'Scorpio', id: 'scorpio', image: require('@/assets/images/scorpio.webp') },
  { emoji: '♐', name: 'Sagittarius', id: 'sagittarius', image: require('@/assets/images/sagittarius.webp') },
  { emoji: '♑', name: 'Capricorn', id: 'capricorn', image: require('@/assets/images/capricorn.webp') },
  { emoji: '♒', name: 'Aquarius', id: 'aquarius', image: require('@/assets/images/aquarius.webp') },
  { emoji: '♓', name: 'Pisces', id: 'pisces', image: require('@/assets/images/pisces.webp') },
];

export function getZodiacSign(id: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.id === id);
}

export function getZodiacFromDate(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const id =
    (month === 1 && day >= 20) || (month === 2 && day <= 18)
      ? 'aquarius'
      : (month === 2 && day >= 19) || (month === 3 && day <= 20)
        ? 'pisces'
        : (month === 3 && day >= 21) || (month === 4 && day <= 19)
          ? 'aries'
          : (month === 4 && day >= 20) || (month === 5 && day <= 20)
            ? 'taurus'
            : (month === 5 && day >= 21) || (month === 6 && day <= 20)
              ? 'gemini'
              : (month === 6 && day >= 21) || (month === 7 && day <= 22)
                ? 'cancer'
                : (month === 7 && day >= 23) || (month === 8 && day <= 22)
                  ? 'leo'
                  : (month === 8 && day >= 23) || (month === 9 && day <= 22)
                    ? 'virgo'
                    : (month === 9 && day >= 23) || (month === 10 && day <= 22)
                      ? 'libra'
                      : (month === 10 && day >= 23) || (month === 11 && day <= 21)
                        ? 'scorpio'
                        : (month === 11 && day >= 22) || (month === 12 && day <= 21)
                          ? 'sagittarius'
                          : 'capricorn';
  return getZodiacSign(id)!;
}
