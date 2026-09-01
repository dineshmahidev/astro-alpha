import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useMemo } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNakshatraName, getRashiName } from '@/constants/i18n';
import { uiStrings } from '@/constants/ui-strings';
import { useAuth } from '@/contexts/auth-context';
import { computeDailyHoroscope } from '@/lib/pipeline';
import { fs, lh } from '@/lib/utils/text-size';
import { getVedicSignFromDate } from '@/lib/vedic';

const ACCENT = '#B09C66';

function ageFrom(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return Math.max(age, 0);
}

const QUICK_ACTIONS: { image: any; label: string; route: '/jathagam' | '/match' | '/tarot' | '/palms' }[] = [
  { image: require('@/assets/images/quick-action/astrology.png'), label: 'Jathagam', route: '/jathagam' },
  { image: require('@/assets/images/quick-action/match.png'), label: 'Match', route: '/match' },
  { image: require('@/assets/images/quick-action/tarot.png'), label: 'Tarot', route: '/tarot' },
  { image: require('@/assets/images/quick-action/horoscope.png'), label: 'Palm', route: '/palms' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, birthDetails, language, credits } = useAuth();
  const t = uiStrings(language).t;

  const birthDate = birthDetails
    ? birthDetails.tobKnown && birthDetails.tobDate
      ? birthDetails.tobDate
      : birthDetails.dobDate
    : null;
  const vedic = birthDate ? getVedicSignFromDate(birthDate) : null;
  const displayName = birthDetails?.name ?? user?.name?.split(' ')[0] ?? 'Guest';
  const rashiName = vedic ? getRashiName(language, vedic.rashiIndex) : '—';
  const nakshatraName = vedic ? getNakshatraName(language, vedic.nakshatraIndex) : '—';
  const pada = vedic ? `Pada ${vedic.pada}` : '—';
  const age = birthDetails ? `${ageFrom(birthDetails.dobDate)} yrs` : '—';

  const daily = useMemo(() => {
    if (!birthDate) return null;
    try {
      return computeDailyHoroscope(
        { birthDate, place: birthDetails?.place },
        new Date(),
      );
    } catch (e) {
      console.warn('[Home] horoscope compute failed', e);
      return null;
    }
  }, [birthDate, birthDetails?.place]);

  const dailyText =
    daily?.horoscope.categories.General ??
    'A wave of confidence carries you forward. Embrace new opportunities and trust your instincts today. The stars favor clear communication.';

  return (
    <ThemedView style={styles.screen}>
      <Image
        source={require('@/assets/images/background.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          <Image source={require('@/assets/Koshmira_text.png')} style={styles.titleImage} resizeMode="contain" />
          {user && (
            <View style={styles.walletPill}>
              <Ionicons name="wallet" size={15} color="#B09C66" />
              <ThemedText style={styles.walletText}>{credits}</ThemedText>
            </View>
          )}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 90 + insets.bottom },
          ]}>
          <View style={styles.glassCard}>
            <Svg
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              viewBox={`0 0 100 100`}
              preserveAspectRatio="none"
              width="100%"
              height="100%">
              <Defs>
                <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#F2D48B" />
                  <Stop offset="0.5" stopColor="#D9B96C" />
                  <Stop offset="1" stopColor="#B08A3E" />
                </LinearGradient>
              </Defs>
              <Rect width="100" height="100" fill="url(#gold)" />
            </Svg>
            <View style={styles.cardRow}>
              <View style={styles.cardLeft}>
                <ThemedText style={[styles.cardHi, { fontSize: fs(language, 18) }]}>Hi, {displayName}</ThemedText>
                <ThemedText style={[styles.cardRashi, { fontSize: fs(language, 26), lineHeight: lh(language, 26) }]}>{rashiName}</ThemedText>
                <ThemedText style={[styles.cardNak, { fontSize: fs(language, 12) }]}>
                  {nakshatraName} · {pada} · {age}
                </ThemedText>
              </View>
              <View style={styles.cardImageWrap}>
                <Image
                  source={vedic?.image ?? require('@/assets/images/leo.png')}
                  style={styles.cardImage}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { fontSize: fs(language, 15) }]}>{t('home.quickActions')}</ThemedText>
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.map((a) => (
                  <TouchableOpacity
                    key={a.label}
                    style={styles.action}
                    onPress={() => router.push(a.route)}>
                    <Image source={a.image} style={styles.actionIcon} />
                    <ThemedText style={[styles.actionLabel, { fontSize: fs(language, 13) }]}>{a.label}</ThemedText>
                  </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { fontSize: fs(language, 15) }]}>{t('home.horoscope')}</ThemedText>
            <TouchableOpacity
              style={styles.horoscopeCard}
              activeOpacity={0.8}
              onPress={() => router.push('/horoscope')}>
              <View style={styles.horoscopeRow}>
                <View style={styles.horoscopeIconWrap}>
                  <Image
                    source={vedic?.image ?? require('@/assets/images/leo.png')}
                    style={styles.horoscopeIcon}
                  />
                </View>
                <View style={styles.horoscopeBody}>
                  <Text style={[styles.horoscopeTitle, { fontSize: fs(language, 14) }]}>{t('home.horoscope')}</Text>
                  <Text style={[styles.horoscopeText, { fontSize: fs(language, 13), lineHeight: lh(language, 13) }]}>{dailyText}</Text>
                  {daily && (
                    <Text style={[styles.horoscopeLucky, { fontSize: fs(language, 12) }]}>
                      {t('home.luckyWindow')}: {daily.horoscope.luckyPeriod}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  safe: {
    flex: 1,
  },
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  titleImage: {
    height: 30,
    width: 140,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(29,29,28,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.4)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  walletText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#EEEDE0',
  },
  content: {
    paddingBottom: 24,
  },
  glassCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.5)',
    shadowColor: '#FFD98A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  cardRow: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    gap: 12,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardHi: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(90,60,10,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardRashi: {
    fontSize: 26,
    lineHeight: 40,
    fontWeight: 'bold',
    color: '#4A2F05',
  },
  cardNak: {
    fontSize: 12,
    color: 'rgba(60,40,10,0.85)',
    fontWeight: '600',
  },
  cardImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,240,200,0.6)',
  },
  cardImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EEEDE0',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#1D1D1C',
  },
  actionIcon: {
    width: 32,
    height: 32,
  },
  actionLabel: {
    fontSize: 13,
    color: '#EEEDE0',
  },
  horoscopeCard: {
    backgroundColor: 'rgba(29,29,28,0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.4)',
  },
  horoscopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  horoscopeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(29,29,28,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.4)',
    marginRight: 14,
  },
  horoscopeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  horoscopeBody: {
    flex: 1,
  },
  horoscopeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE9A8',
    marginBottom: 4,
  },
  horoscopeText: {
    color: '#F3F2EC',
    lineHeight: 20,
  },
  horoscopeLucky: {
    color: '#FFE9A8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
