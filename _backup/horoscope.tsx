import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNakshatraName, getRashiName, RASHI_NAMES, type AppLanguage } from '@/constants/i18n';
import { uiStrings } from '@/constants/ui-strings';
import { ZODIAC_SIGNS } from '@/constants/zodiac';
import { useAuth } from '@/contexts/auth-context';
import { computeDailyHoroscope } from '@/lib/pipeline';
import { getVedicSignFromDate } from '@/lib/vedic';

const LUCKY_NUMBERS: string[] = [
  '1', '5', '3', '2', '1', '5',
  '3', '7', '9', '1', '7', '3',
];
const LUCKY_COLORS: string[] = [
  'Red', 'Green', 'Yellow', 'Silver', 'Gold', 'Green',
  'White', 'Red', 'Purple', 'Black', 'Blue', 'Sea Green',
];

const GOLD = '#C9BE98';

function GoldGlow() {
  const glow = useRef(new Animated.Value(0)).current;
  const glowStyle = useMemo(() => ({ opacity: glow }), [glow]);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);
  return <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />;
}

const ACCENT = '#B09C66';

const todayLabel = (() => {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
})();

export default function HoroscopeScreen() {
  const router = useRouter();
  const { birthDetails, language } = useAuth();
  const t = uiStrings(language).t;
  const [selected, setSelected] = useState<string | null>(null);

  const birthDate = birthDetails
    ? birthDetails.tobKnown && birthDetails.tobDate
      ? birthDetails.tobDate
      : birthDetails.dobDate
    : null;
  const vedic = birthDate ? getVedicSignFromDate(birthDate) : null;
  const userSign = vedic ?? {
    name: ZODIAC_SIGNS[4].name,
    id: ZODIAC_SIGNS[4].id,
    image: ZODIAC_SIGNS[4].image,
    rashiIndex: 4,
    nakshatraIndex: 9,
    pada: 1,
  } as const;
  const rashiName = getRashiName(language, userSign.rashiIndex);
  const nakshatraName = getNakshatraName(language, userSign.nakshatraIndex);

  const daily = useMemo(() => {
    if (!birthDate) return null;
    try {
      return computeDailyHoroscope(
        { birthDate, place: birthDetails?.place },
        new Date(),
      );
    } catch (e) {
      console.warn('[Horoscope] compute failed', e);
      return null;
    }
  }, [birthDate, birthDetails?.place]);

  const heroText =
    daily?.horoscope.categories.General ??
    'A day of confident energy. Bold moves pay off and recognition comes your way.';

  return (
    <ThemedView style={styles.screen}>
      <Image source={require('@/assets/images/background.png')} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>Daily Horoscope</ThemedText>
            <ThemedText style={styles.dateText}>
              {todayLabel}
            </ThemedText>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroLeft}>
              <Image source={userSign.image} style={styles.heroImage} />
              <ThemedText style={styles.heroSign}>{ZODIAC_SIGNS[userSign.rashiIndex].name}</ThemedText>
              <ThemedText style={styles.heroSignTamil}>{rashiName}</ThemedText>
              <ThemedText style={styles.heroUser}>
                {nakshatraName} · Pada {userSign.pada}
              </ThemedText>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroRight}>
              <View style={styles.heroTitleRow}>
                <Ionicons name="sunny" size={18} color={ACCENT} />
                <ThemedText style={styles.heroTitle}>Today's Horoscope</ThemedText>
              </View>
              <ThemedText style={styles.heroText}>{heroText}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.hint}>Select your zodiac sign</ThemedText>
          <View style={styles.grid}>
            {ZODIAC_SIGNS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.item, selected === s.id && styles.itemActive]}
                onPress={() => setSelected(s.id)}
                activeOpacity={0.7}>
                <GoldGlow />
                <Image source={s.image} style={styles.image} />
                <ThemedText
                  style={[styles.name, selected === s.id && styles.nameActive]}>
                  {s.name}
                </ThemedText>
                <ThemedText
                  style={[styles.nameTamil, selected === s.id && styles.nameActive]}>
                  {RASHI_NAMES[language][ZODIAC_SIGNS.indexOf(s)]}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          {selected && daily && (
            <View style={styles.reportCard}>
              <ThemedText style={styles.reportTitle}>
                {ZODIAC_SIGNS.find((s) => s.id === selected)?.name} Today
              </ThemedText>
              <ThemedText style={styles.reportText}>
                {daily.horoscope.categories.General}
              </ThemedText>
              <ThemedText style={styles.reportLucky}>
                Lucky window: {daily.horoscope.luckyPeriod}
              </ThemedText>
              <View style={styles.luckyRow}>
                <View style={styles.luckyCard}>
                  <Ionicons name="star" size={16} color={ACCENT} />
                  <ThemedText style={styles.luckyLabel}>{t('horoscope.luckyNumber')}</ThemedText>
                  <ThemedText style={styles.luckyValue}>
                    {LUCKY_NUMBERS[ZODIAC_SIGNS.findIndex((s) => s.id === selected)]}
                  </ThemedText>
                </View>
                <View style={styles.luckyCard}>
                  <Ionicons name="color-fill" size={16} color={ACCENT} />
                  <ThemedText style={styles.luckyLabel}>{t('horoscope.luckyColor')}</ThemedText>
                  <ThemedText style={styles.luckyValue}>
                    {LUCKY_COLORS[ZODIAC_SIGNS.findIndex((s) => s.id === selected)]}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => {
                  const signName = ZODIAC_SIGNS.find((s) => s.id === selected)?.name ?? '';
                  const text = `${signName} ${t('home.horoscope')}\n\n${daily.horoscope.categories.General}\n\n${t('horoscope.luckyNumber')}: ${LUCKY_NUMBERS[ZODIAC_SIGNS.findIndex((s) => s.id === selected)]} · ${t('horoscope.luckyColor')}: ${LUCKY_COLORS[ZODIAC_SIGNS.findIndex((s) => s.id === selected)]}`;
                  Linking.openURL(`https://wa.me/?text=${encodeURIComponent(text)}`);
                }}>
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <ThemedText style={styles.shareBtnText}>{t('home.share')}</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0' },
  dateText: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  content: { padding: 16 },
  heroCard: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroLeft: { alignItems: 'center', width: 100 },
  heroImage: { width: 64, height: 64 },
  heroSign: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginTop: 6 },
  heroSignTamil: { color: '#ffe9d4', fontSize: 12, marginTop: 2 },
  heroUser: { color: '#ffe9d4', fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 84, backgroundColor: '#ffd9b8', marginHorizontal: 14 },
  heroRight: { flex: 1 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' },
  heroText: { color: '#fff6ed', fontSize: 13, lineHeight: 19, marginTop: 6 },
  hint: { fontSize: 14, color: '#7E7E78', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  item: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: '#1D1D1C',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#97743B',
    shadowColor: '#97743B',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  itemActive: { backgroundColor: ACCENT },
  image: { width: 44, height: 44 },
  name: { fontSize: 12, color: '#EEEDE0', marginTop: 4 },
  nameTamil: { fontSize: 10, color: '#7E7E78', marginTop: 1 },
  nameActive: { color: '#ffffff' },
  reportCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  reportText: { fontSize: 15, color: '#7E7E78', lineHeight: 23 },
  reportLucky: { fontSize: 13, color: ACCENT, fontWeight: '600', marginTop: 8 },
  luckyRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  luckyCard: {
    flex: 1,
    backgroundColor: '#2A2A28',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  luckyLabel: { fontSize: 11, color: '#7E7E78' },
  luckyValue: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
  },
  shareBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
