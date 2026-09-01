import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/avatar';
import SideDrawer from '@/components/side-drawer';
import { useAuth } from '@/contexts/auth-context';
import { useAstrologers } from '@/hooks/use-astrologers';
import { AI_SPECIALISTS } from '@/constants/ai-specialists';

const ACCENT = '#B09C66';
const GOLD = '#97743B';
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const GREEN = '#7BD88F';
const PURPLE = '#8B5CF6';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_LIGHT = '#888888';
const { width: SCREEN_W } = Dimensions.get('window');

const BANNERS = [
  {
    id: 'tarot',
    title: 'Pull a Tarot Card',
    sub: 'Discover your destiny',
    btn: 'Draw Card',
    icon: 'star' as const,
    bg: '#0D2A3D',
    mystery: 'A hidden truth is about to reveal itself...',
  },
];

const SERVICES = [
  { icon: 'people-outline' as const, label: 'Astrologers', color: '#E57373', route: '/astrologers-market' },
  { icon: 'hand-left-outline' as const, label: 'Palm\nReading', color: '#FFB74D', route: '/palm-reading' },
  { icon: 'document-text-outline' as const, label: 'Kundli', color: '#4FC3F7', route: '/kundli' },
  { icon: 'heart-outline' as const, label: 'Match\nMaking', color: '#BA68C8', route: '/match' },
];

export default function ConsumerHome() {
  const router = useRouter();
  const { user, birthDetails } = useAuth();
  const { astrologers } = useAstrologers();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Scrolling headline
  const scrollX = useRef(new Animated.Value(0)).current;
  const HEADLINES = [
    'Discover your destiny with AI-powered astrology',
    'Check your daily horoscope now',
    'Find your perfect match with 10 Porutham',
    'Get personalized kundli analysis',
    'Chat with expert astrologers online',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(scrollX, { toValue: -SCREEN_W * HEADLINES.length, duration: 30000, useNativeDriver: true }).start(() => {
        scrollX.setValue(0);
      });
    }, 32000);
    return () => clearInterval(timer);
  }, []);

  const topAstrologers = astrologers.slice(0, 3);

  return (
    <ThemedView style={s.screen}>
      <StatusBar style="dark" />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {drawerOpen && <View style={s.blurOverlay} />}
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <TouchableOpacity style={s.hamburger} onPress={() => setDrawerOpen(true)}>
                <View style={s.hamLine1} />
                <View style={s.hamLine2} />
                <View style={s.hamLine3} />
              </TouchableOpacity>
              <View>
                <ThemedText style={s.greeting}>Hi, {user?.name?.split(' ')[0] ?? 'User'} 👋</ThemedText>
                {birthDetails?.rashi && (
                  <Text style={s.userRasi}>{birthDetails.rashi} • {birthDetails.nakshatra ?? ''}</Text>
                )}
              </View>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.coinBadge} onPress={() => router.push('/topup')}>
                <Text style={s.coinRupee}>₹</Text>
                <ThemedText style={s.coinText}>300</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/edit-profile')}>
                <Avatar uri="" name={user?.name ?? 'U'} size={36} color={ACCENT} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrolling Headline */}
          <View style={s.headlineWrap}>
            <Animated.View style={[s.headlineTrack, { transform: [{ translateX: scrollX }] }]}>
              {[...HEADLINES, ...HEADLINES].map((h, i) => (
                <Text key={i} style={s.headlineText}>{h}   •   </Text>
              ))}
            </Animated.View>
          </View>

          {/* Services Row */}
          <View style={s.servicesRow}>
            {SERVICES.map((svc) => (
              <TouchableOpacity key={svc.label} style={s.serviceCard} onPress={() => svc.route && router.push(svc.route as any)}>
                <Ionicons name={svc.icon} size={26} color={svc.color} />
                <ThemedText style={s.serviceLabel}>{svc.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Banner */}
          <View style={s.bannerWrap}>
            <View style={s.bannerMargin}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/tarot')}>
                <ImageBackground
                  source={require('../../assets/tarot-banner.png')}
                  style={s.banner}
                  imageStyle={s.bannerImage}
                  resizeMode="cover"
                >
                  <View style={s.bannerLeft}>
                    <Text style={s.bannerTitle}>{BANNERS[0].title}</Text>
                    <Text style={s.bannerSub}>{BANNERS[0].sub}</Text>
                    <View style={s.bannerBtn}>
                      <Text style={s.bannerBtnText}>{BANNERS[0].btn}</Text>
                    </View>
                    <Text style={s.bannerMystery}>{BANNERS[0].mystery}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Specialists */}
          <View style={s.sectionHeader}>
            <ThemedText style={s.sectionTitle}>AI Specialists</ThemedText>
            <TouchableOpacity>
              <ThemedText style={s.viewAll}>VIEW ALL</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.aiRow}>
            {AI_SPECIALISTS.map((spec) => (
              <TouchableOpacity key={spec.id} style={s.aiCard} onPress={() => router.push(`/ai-specialist/${spec.id}`)}>
                <Image source={spec.avatar} style={s.aiImage} contentFit="cover" />
                <ThemedText style={s.aiName} numberOfLines={1}>{spec.name}</ThemedText>
                <ThemedText style={s.aiTag} numberOfLines={1}>{spec.tagline}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Top Astrologers */}
          <View style={s.sectionHeader}>
            <ThemedText style={s.sectionTitle}>Our Top Astrologers</ThemedText>
            <TouchableOpacity>
              <ThemedText style={s.viewAll}>VIEW ALL</ThemedText>
            </TouchableOpacity>
          </View>
          {topAstrologers.map((astro) => (
            <View key={astro.id} style={s.astroCard}>
              <View style={s.astroTop}>
                <Avatar uri={astro.avatar ?? ''} name={astro.name} size={44} color={ACCENT} />
                <View style={s.astroInfo}>
                  <ThemedText style={s.astroName}>{astro.name}</ThemedText>
                  <ThemedText style={s.astroSpec}>{astro.specialization?.[0] ?? 'Vedic Astrology'}</ThemedText>
                  <ThemedText style={s.astroLang}>{astro.languages?.join(', ') ?? 'English, Hindi'}</ThemedText>
                </View>
                <View style={s.astroPrice}>
                  <Ionicons name="time" size={14} color={ACCENT} />
                  <ThemedText style={s.priceText}>30/min</ThemedText>
                </View>
              </View>
              <View style={s.astroActions}>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="chatbubble" size={16} color={ACCENT} />
                  <ThemedText style={s.actionText}>Chat</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="call" size={16} color={ACCENT} />
                  <ThemedText style={s.actionText}>Call</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="videocam" size={16} color={ACCENT} />
                  <ThemedText style={s.actionText}>Video Call</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 5,
  },
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hamburger: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
    gap: 5,
  },
  hamLine1: { width: 24, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  hamLine2: { width: 18, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  hamLine3: { width: 12, height: 2, backgroundColor: TEXT_DARK, borderRadius: 1 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK },
  userRasi: { fontSize: 12, color: ACCENT, fontWeight: '600', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  coinText: { fontSize: 13, fontWeight: '600', color: GREEN },
  coinRupee: { fontSize: 14, fontWeight: '700', color: GREEN },

  // Scrolling Headline
  headlineWrap: { overflow: 'hidden', height: 28, marginHorizontal: 16, marginBottom: 8, justifyContent: 'center' },
  headlineTrack: { flexDirection: 'row', alignItems: 'center' },
  headlineText: { fontSize: 13, color: ACCENT, fontWeight: '500', whiteSpace: 'nowrap' },

  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  serviceCard: { alignItems: 'center', gap: 8, width: 72 },
  serviceLabel: { fontSize: 12, fontWeight: '500', color: TEXT_DARK, textAlign: 'center', lineHeight: 16 },

  bannerWrap: { marginTop: 20 },
  bannerMargin: { marginHorizontal: 16 },
  banner: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingHorizontal: 30,
    paddingVertical: 20,
    overflow: 'hidden',
    minHeight: 120,
  },
  bannerImage: {
    borderRadius: 14,
  },
  bannerLeft: { flex: 1, gap: 3 },
  bannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginBottom: 6 },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bannerBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  bannerMystery: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontStyle: 'italic' },
  bannerRight: { justifyContent: 'center', alignItems: 'center', width: 60 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_DARK },
  viewAll: { fontSize: 12, fontWeight: '600', color: ACCENT },

  aiRow: { paddingHorizontal: 16, gap: 10 },
  aiCard: {
    width: 110,
    height: 140,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  aiImage: {
    width: '100%',
    height: 95,
  },
  aiName: { fontSize: 12, fontWeight: '600', color: TEXT_DARK, textAlign: 'center', marginTop: 6, paddingHorizontal: 4 },
  aiTag: { fontSize: 10, color: TEXT_MID, textAlign: 'center', lineHeight: 13, paddingHorizontal: 6 },

  astroCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  astroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  astroInfo: { flex: 1, gap: 2 },
  astroName: { fontSize: 14, fontWeight: 'bold', color: TEXT_DARK },
  astroSpec: { fontSize: 12, color: ACCENT },
  astroLang: { fontSize: 11, color: TEXT_MID },
  astroPrice: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceText: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },

  astroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(176,156,102,0.1)',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  actionText: { fontSize: 12, fontWeight: '600', color: ACCENT },
});
