import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { AI_SPECIALISTS, getLocalizedName, getLocalizedTagline } from '@/constants/ai-specialists';

const ROYAL_GOLD = '#292723';
const GOLD = '#C9BE98';

const HEADER_TEXT: Record<string, { title: string; subtitle: string }> = {
  en: { title: 'Select AI Specialist', subtitle: 'Choose a royal guide for your chart' },
  ta: { title: 'AI நிபுணரைத் தேர்ந்தெடுங்கள்', subtitle: 'உங்கள் சார்ட்டுக்கு ஒரு அரச வழிகாட்டியைத் தேர்ந்தெடுங்கள்' },
  hi: { title: 'AI विशेषज्ञ चुनें', subtitle: 'अपनी कुंडली के लिए एक रoyal गाइड चुनें' },
};

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

export default function SelectAISpecialistScreen() {
  const router = useRouter();
  const { language } = useAuth();
  const header = HEADER_TEXT[language] ?? HEADER_TEXT.en;

  return (
    <ThemedView style={styles.screen}>
      <Image source={require('@/assets/images/background.png')} style={StyleSheet.absoluteFillObject} />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>{header.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{header.subtitle}</ThemedText>
          </View>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {AI_SPECIALISTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/ai/[id]', params: { id: s.id } })
              }>
              <GoldGlow />
              <View style={styles.cardImageWrap}>
                <Image source={s.avatar} style={styles.cardImage} contentFit="cover" />
                <View style={styles.iconBadge}>
                  <Ionicons name={s.icon as any} size={16} color="#ffffff" />
                </View>
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardName} numberOfLines={1}>
                  {getLocalizedName(s, language)}
                </ThemedText>
                <ThemedText style={styles.cardTagline} numberOfLines={2}>
                  {getLocalizedTagline(s, language)}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safe: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0' },
  subtitle: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    width: 160,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: GOLD,
    overflow: 'hidden',
    backgroundColor: ROYAL_GOLD,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#97743B',
    shadowColor: '#97743B',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  cardImageWrap: { position: 'relative' },
  cardImage: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: '#97743B',
  },
  iconBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#97743B',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOLD,
  },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: 'bold', color: '#EEEDE0' },
  cardTagline: { fontSize: 12, color: '#C9BE98', marginTop: 3, lineHeight: 16 },
});
