import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AI_SPECIALISTS } from '@/constants/ai-specialists';

const ROYAL_GOLD = '#292723';
const GOLD = '#C9BE98';

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
  return <Animated.View pointerEvents="none" style={[styles.glow, { opacity: glow }]} />;
}

export default function SelectAISpecialistScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>Select AI Specialist</ThemedText>
            <ThemedText style={styles.subtitle}>Choose a royal guide for your chart</ThemedText>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.grid}>
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
                    {s.name}
                  </ThemedText>
                  <ThemedText style={styles.cardTagline} numberOfLines={2}>
                    {s.tagline}
                  </ThemedText>
                </View>
              </TouchableOpacity>
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
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0' },
  subtitle: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  content: { padding: 16, paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
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
    aspectRatio: 0.558,
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