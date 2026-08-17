import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ASTROLOGERS } from '@/constants/astrologers';

const HEADER_COLOR = '#B09C66';

type IconName = keyof typeof Ionicons.glyphMap;

const QUICK_ACTIONS: { image: any; label: string; route: '/kundli' | '/horoscope' | '/match' | '/tarot' }[] = [
  { image: require('@/assets/images/quick-action/astrology.png'), label: 'Kundli', route: '/kundli' },
  { image: require('@/assets/images/quick-action/horoscope.png'), label: 'Horoscope', route: '/horoscope' },
  { image: require('@/assets/images/quick-action/match.png'), label: 'Match', route: '/match' },
  { image: require('@/assets/images/quick-action/tarot.png'), label: 'Tarot', route: '/tarot' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topHeader}>
          <ThemedText style={styles.title}>My Astro</ThemedText>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 90 + insets.bottom },
          ]}>
          <View style={styles.brownBox}>
            <View style={styles.cardText}>
              <ThemedText style={styles.greeting}>Good Morning</ThemedText>
              <ThemedText style={styles.zodiac}>Sun in Leo</ThemedText>
              <ThemedText style={styles.tagline}>Today is your day to shine</ThemedText>
            </View>
            <View style={styles.circlePlaceholder}>
              <Image source={require('@/assets/images/leo.png')} style={styles.circleImage} />
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.map((a) => (
                  <TouchableOpacity
                    key={a.label}
                    style={styles.action}
                    onPress={() => router.push(a.route)}>
                    <Image source={a.image} style={styles.actionIcon} />
                    <ThemedText style={styles.actionLabel}>{a.label}</ThemedText>
                  </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Today's Horoscope</ThemedText>
            <View style={styles.horoscopeCard}>
              <ThemedText style={styles.horoscopeText}>
                A wave of confidence carries you forward. Embrace new opportunities and trust your
                instincts today. The stars favor clear communication.
              </ThemedText>
            </View>
          </View>

          <View style={styles.astroSection}>
            <ThemedText style={[styles.sectionTitle, styles.astroSectionTitle]}>
              Top Astrologers
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.astroRow}>
              {ASTROLOGERS.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={{ pathname: '/chat/[id]', params: { id: a.id } }}
                  asChild>
                  <TouchableOpacity style={styles.astroCard}>
                    <Image source={{ uri: a.avatar }} style={styles.astroAvatar} />
                    <ThemedText style={styles.astroName} numberOfLines={1}>
                      {a.name}
                    </ThemedText>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#B89A5B" />
                      <ThemedText style={styles.ratingText}>{a.rating}</ThemedText>
                    </View>
                    <View style={styles.chatBtn}>
                      <ThemedText style={styles.chatBtnText}>Chat</ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </ScrollView>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EEEDE0',
  },
  content: {
    paddingBottom: 24,
  },
  brownBox: {
    height: 160,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: HEADER_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    color: '#ffffff',
    fontSize: 16,
  },
  zodiac: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#ffe0b3',
    fontSize: 13,
  },
  circlePlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1D1D1C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  circleImage: {
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
  astroSection: {
    marginTop: 24,
  },
  astroSectionTitle: {
    paddingHorizontal: 16,
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
    backgroundColor: '#1D1D1C',
    borderRadius: 12,
    padding: 16,
  },
  horoscopeText: {
    color: '#7E7E78',
    lineHeight: 22,
  },
  astroRow: {
    paddingHorizontal: 16,
  },
  astroCard: {
    width: 130,
    alignItems: 'center',
    padding: 14,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1D1D1C',
  },
  astroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HEADER_COLOR,
  },
  astroName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EEEDE0',
    marginTop: 8,
    maxWidth: 110,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  ratingText: { fontSize: 12, color: '#7E7E78' },
  chatBtn: {
    backgroundColor: HEADER_COLOR,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  chatBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
});
