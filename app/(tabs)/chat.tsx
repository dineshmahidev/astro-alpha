import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ASTROLOGERS } from '@/constants/astrologers';

const ACCENT = '#B09C66';
const GOLD = '#97743B';
const ROYAL_GOLD = '#C9BE98';

function GoldGlow() {
  const glow = useRef(new Animated.Value(0)).current;
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
  return <Animated.View pointerEvents="none" style={[styles.aiGlow, { opacity: glow }]} />;
}

type IconName = keyof typeof Ionicons.glyphMap;

const AI_SPECIALISTS: {
  id: string;
  name: string;
  tagline: string;
  avatar: any;
  icon: IconName;
}[] = [
  { id: 'health', name: 'Health Advisor', tagline: 'Astro health tips & remedies', avatar: require('@/assets/images/ai-chat/Female_healer_holding_mystical_s__202608170131.jpeg'), icon: 'heart' },
  { id: 'wealth', name: 'Wealth Guru', tagline: 'Money, career & investments', avatar: require('@/assets/images/ai-chat/Wealth_mystic_holding_golden_pen__202608170131.jpeg'), icon: 'cash' },
  { id: 'marriage', name: 'Marriage Match', tagline: 'Love, compatibility & timing', avatar: require('@/assets/images/ai-chat/Gothic_oracle_holding_glowing_rings_202608170131.jpeg'), icon: 'people' },
  { id: 'specialist', name: 'Specialist', tagline: 'Deep dive into your chart', avatar: require('@/assets/images/ai-chat/Astrologer_holding_mystical_astr__202608170131.jpeg'), icon: 'medkit' },
];

export default function ChatScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            stickyHeaderIndices={[1]}>
          <ThemedText style={styles.title}>Chat</ThemedText>

          <View style={styles.circleWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.circleRow}>
              <View style={styles.circleRowInner}>
                <TouchableOpacity
                  style={styles.circle}
                  onPress={() => router.push('/ai' as any)}>
                  <View style={[styles.circleAvatar, styles.aiCircle]}>
                    <Ionicons name="sparkles" size={26} color="#ffffff" />
                  </View>
                  <ThemedText style={styles.circleLabel}>AI</ThemedText>
                </TouchableOpacity>
                {ASTROLOGERS.map((a) => (
                  <Link
                    key={a.id}
                    href={{ pathname: '/chat/[id]', params: { id: a.id } }}
                    asChild>
                    <TouchableOpacity style={styles.circle}>
                      <Image source={{ uri: a.avatar }} style={styles.circleAvatar} />
                      <ThemedText style={styles.circleLabel}>{a.name}</ThemedText>
                    </TouchableOpacity>
                  </Link>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.aiSection}>
            <ThemedText style={styles.aiSectionTitle}>AI Specialists</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiRow}>
              {AI_SPECIALISTS.map((c) => (
                <Link
                  key={c.id}
                  href={{ pathname: '/ai/[id]', params: { id: c.id } }}
                  asChild>
                  <TouchableOpacity style={styles.aiCard}>
                    <GoldGlow />
                    <View style={styles.aiImageWrap}>
                      <Image source={c.avatar} style={styles.aiCover} contentFit="cover" />
                      <View style={styles.aiIconBadge}>
                        <Ionicons name={c.icon} size={16} color="#ffffff" />
                      </View>
                    </View>
                    <View style={styles.aiCardInfo}>
                      <ThemedText style={styles.aiCardLabel} numberOfLines={1}>
                        {c.name}
                      </ThemedText>
                      <ThemedText style={styles.aiCardTag} numberOfLines={1}>
                        {c.tagline}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </Link>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Astrologer Chat</ThemedText>
            {ASTROLOGERS.map((a) => (
              <Link
                key={a.id}
                href={{ pathname: '/chat/[id]', params: { id: a.id } }}
                asChild>
                <TouchableOpacity style={styles.chatItem}>
                  <Image source={{ uri: a.avatar }} style={styles.chatAvatar} />
                  <View style={styles.chatInfo}>
                    <ThemedText style={styles.chatName}>{a.name}</ThemedText>
                    <ThemedText style={styles.chatMsg} numberOfLines={1}>
                      {a.lastMsg}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.chatTime}>{a.time}</ThemedText>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  content: { paddingTop: 0, paddingBottom: 120 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EEEDE0',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 16,
  },
  circleWrap: {
    backgroundColor: '#121212',
    paddingBottom: 12,
  },
  circleRow: { paddingHorizontal: 16 },
  circleRowInner: { flexDirection: 'row', gap: 16 },
  circle: { alignItems: 'center', gap: 6 },
  circleAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1D1D1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCircle: {
    backgroundColor: GOLD,
    borderWidth: 2,
    borderColor: ROYAL_GOLD,
  },
  circleLabel: { fontSize: 12, color: '#EEEDE0' },
  aiSection: { marginTop: 20 },
  aiSectionTitle: { paddingHorizontal: 16, marginBottom: 12, color: '#EEEDE0' },
  aiRow: { paddingHorizontal: 16 },
  aiCard: {
    width: 140,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: ROYAL_GOLD,
    overflow: 'hidden',
    backgroundColor: '#292723',
    marginRight: 12,
  },
  aiGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  aiImageWrap: { position: 'relative' },
  aiCover: {
    width: '100%',
    aspectRatio: 0.558,
    backgroundColor: GOLD,
  },
  aiIconBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: GOLD,
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ROYAL_GOLD,
  },
  aiCardInfo: { padding: 8 },
  aiCardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EEEDE0',
  },
  aiCardTag: { fontSize: 12, color: '#C9BE98', marginTop: 3, lineHeight: 16 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  chatAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ACCENT,
  },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatName: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  chatMsg: { fontSize: 13, color: '#7E7E78', marginTop: 2 },
  chatTime: { fontSize: 12, color: '#7E7E78' },
});
