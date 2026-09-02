import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  Dimensions,
  Animated,
  FlatList,
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

const SLIDES = [
  { id: '1', image: require('../../assets/tarot-banner.png') },
  { id: '2', image: require('../../assets/match-banner.png') },
  { id: '3', image: require('../../assets/astrologer-eranings.png') },
];

const SCREEN_W = Dimensions.get('window').width;

const SERVICES = [
  { icon: 'people' as const, label: 'Astrologers', color: '#E57373', route: '/astrologers-market' },
  { icon: 'hand-left' as const, label: 'Palm Reading', color: '#FFB74D', route: '/palm-reading' },
  { icon: 'document-text' as const, label: 'Kundli', color: '#4FC3F7', route: '/kundli' },
  { icon: 'heart' as const, label: 'Match Making', color: '#BA68C8', route: '/match' },
];

export default function ConsumerHome() {
  const router = useRouter();
  const { user, birthDetails, credits } = useAuth();
  const { astrologers } = useAstrologers();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'ai' | 'astro'>('ai');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const topAstrologers = astrologers.slice(0, 6);

  const headlines = [
    `Hi, ${user?.name?.split(' ')[0] ?? 'User'} 👋`,
    birthDetails?.rashi ? `Rasi • ${birthDetails.rashi}` : null,
    birthDetails?.nakshatra ? `Nakshatra • ${birthDetails.nakshatra}` : null,
    birthDetails?.rashi ? `Padam • ${birthDetails.nakshatra ?? ''}` : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (headlines.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [headlines.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        flatListRef.current?.scrollToOffset({ offset: next * SCREEN_W, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemedView style={s.screen}>
      <StatusBar style="light" />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {drawerOpen && <View style={s.blurOverlay} />}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Auto Slider Top 25% */}
          <View style={s.sliderContainer}>
            <SafeAreaView style={s.videoHeader} edges={['top']}>
              <View style={s.header}>
                <TouchableOpacity style={s.hamburger} onPress={() => setDrawerOpen(true)}>
                  <View style={s.hamLine1} />
                  <View style={s.hamLine2} />
                  <View style={s.hamLine3} />
                </TouchableOpacity>
                <View style={s.headerSpacer} />
                <TouchableOpacity style={s.coinBadge} onPress={() => router.push('/topup')}>
                  <Ionicons name="wallet-outline" size={16} color="#FFF" />
                  <Text style={s.coinText}>{credits ?? 300}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            <FlatList
              ref={flatListRef}
              data={SLIDES}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Image source={item.image} style={s.slideImage} contentFit="cover" />
              )}
            />

            {/* Dots */}
            <View style={s.dotsContainer}>
              {SLIDES.map((_, i) => (
                <View key={i} style={[s.dot, slideIndex === i && s.dotActive]} />
              ))}
            </View>

            {/* Separator line */}
            <View style={s.sliderLine} />
          </View>

          {/* Animated Headline */}
          <View style={s.rasiBar}>
            <Animated.Text style={[s.rasiText, { opacity: fadeAnim }]}>
              {headlines[headlineIndex]}
            </Animated.Text>
          </View>

          {/* Services Grid */}
          <View style={s.servicesGrid}>
            {SERVICES.map((svc) => (
              <TouchableOpacity key={svc.label} style={s.serviceCard} onPress={() => svc.route && router.push(svc.route as any)}>
                <View style={s.serviceIcon}>
                  <Ionicons name={svc.icon} size={28} color="#FFFFFF" />
                </View>
                <Text style={s.serviceLabel}>{svc.label}</Text>
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
                    <Text style={s.bannerTitle}>Pull a Tarot Card</Text>
                    <Text style={s.bannerSub}>Discover your destiny</Text>
                    <View style={s.bannerBtn}>
                      <Text style={s.bannerBtnText}>Draw Card</Text>
                    </View>
                    <Text style={s.bannerMystery}>A hidden truth is about to reveal itself...</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Specialists / Astrologers Toggle */}
          <View style={s.sectionHeader}>
            <TouchableOpacity onPress={() => setActiveSection('ai')}>
              <Text style={[s.sectionTab, activeSection === 'ai' && s.sectionTabActive]}>AI Specialists</Text>
            </TouchableOpacity>
            <View style={s.sectionPipe} />
            <TouchableOpacity onPress={() => setActiveSection('astro')}>
              <Text style={[s.sectionTab, activeSection === 'astro' && s.sectionTabActive]}>Astrologers</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => router.push(activeSection === 'ai' ? '/ai-specialist' : '/astrologers-market')}>
              <ThemedText style={s.viewAll}>VIEW ALL</ThemedText>
            </TouchableOpacity>
          </View>

          {/* AI Specialists List */}
          {activeSection === 'ai' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.aiRow}>
              {AI_SPECIALISTS.map((spec) => (
                <TouchableOpacity key={spec.id} style={s.aiCard} onPress={() => router.push(`/ai-specialist/${spec.id}`)}>
                  <Image source={spec.avatar} style={s.aiImage} contentFit="cover" />
                  <View style={s.aiOverlay} />
                  <View style={s.aiInfo}>
                    <View style={s.aiTopInfo}>
                      <ThemedText style={s.aiName} numberOfLines={1}>{spec.name}</ThemedText>
                      <ThemedText style={s.aiTag} numberOfLines={1}>{spec.tagline}</ThemedText>
                    </View>
                    <TouchableOpacity style={s.aiChatBtn} onPress={() => router.push(`/ai-specialist/${spec.id}`)}>
                      <Ionicons name="chatbubble" size={12} color="#FFF" />
                      <Text style={s.aiChatText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Astrologers List */}
          {activeSection === 'astro' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.astroRow}>
              {topAstrologers.map((astro) => (
                <TouchableOpacity
                  key={astro.id}
                  activeOpacity={0.8}
                  style={s.astroHCard}
                  onPress={() => router.push(`/astrologer/${astro.id}`)}
                >
                  <View style={s.astroHImageWrap}>
                    {astro.avatar ? (
                      <Image source={{ uri: astro.avatar }} style={s.astroHImage} contentFit="cover" />
                    ) : (
                      <View style={[s.astroHImage, { backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="person" size={48} color="#FFF" />
                      </View>
                    )}
                  </View>
                  <View style={s.astroHInfo}>
                    <Text style={s.astroHName} numberOfLines={1}>{astro.name}</Text>
                    <Text style={s.astroHSpec} numberOfLines={1}>{astro.specialization?.[0] ?? 'Vedic'}</Text>
                    <View style={s.astroHBottom}>
                      <View style={s.astroHReview}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={s.astroHReviewText}>{astro.rating ?? '4.8'}</Text>
                        <Text style={s.astroHReviewCount}>({astro.reviewCount ?? 120})</Text>
                      </View>
                      <Text style={s.astroHPrice}>₹{astro.pricePerMin ?? 10}/min</Text>
                    </View>
                    <TouchableOpacity style={s.astroHChatBtn} onPress={() => router.push(`/chat-room/${astro.id}`)}>
                      <Ionicons name="chatbubble" size={14} color="#FFF" />
                      <Text style={s.astroHChatText}>Chat</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  sliderContainer: { width: '100%', height: Dimensions.get('window').height * 0.25, position: 'relative' },
  videoHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  headerSpacer: { flex: 1 },
  slideImage: { width: SCREEN_W, height: '100%' },
  dotsContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6, zIndex: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#FFFFFF', width: 20 },
  sliderLine: { height: 1, backgroundColor: BORDER },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 5,
  },
  safe: { flex: 1 },
  scroll: { paddingBottom: 40 },

  hamburger: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
    gap: 5,
  },
  hamLine1: { width: 24, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 },
  hamLine2: { width: 18, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 },
  hamLine3: { width: 12, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  coinText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  coinRupee: { fontSize: 14, fontWeight: '700', color: GREEN },

  // Rasi & Nakshatra with Pipe
  headlineContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  pipeVertical: { width: 20, alignItems: 'center', marginRight: 10 },
  pipeTopDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  pipeLine: { width: 2, flex: 1, backgroundColor: ACCENT + '40' },
  pipeMidDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT + '80' },
  pipeBottomDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  headlineDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headlineLabel: { fontSize: 10, fontWeight: '600', color: ACCENT, textTransform: 'uppercase', marginRight: 4 },
  headlineValue: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  headlineDivider: { width: 1, height: 16, backgroundColor: BORDER, marginHorizontal: 12 },

  rasiBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 10 },
  rasiText: { fontSize: 15, fontWeight: 'bold', color: ACCENT },
  rasiPipe: { width: 1.5, height: 16, backgroundColor: ACCENT },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  serviceCard: { width: '22.5%', alignItems: 'center', paddingVertical: 10 },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceLabel: { fontSize: 10, fontWeight: '600', color: TEXT_DARK, textAlign: 'center' },

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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionPipe: { width: 1, height: 14, backgroundColor: BORDER, marginHorizontal: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_DARK },
  sectionTab: { fontSize: 16, fontWeight: 'bold', color: TEXT_LIGHT },
  sectionTabActive: { color: TEXT_DARK },
  viewAll: { fontSize: 12, fontWeight: '600', color: ACCENT },

  aiRow: { paddingHorizontal: 16, gap: 12 },
  aiCard: {
    width: 160,
    height: 240,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  aiInfo: { flex: 1, paddingHorizontal: 10, paddingBottom: 10, justifyContent: 'flex-end' },
  aiOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 16 },
  aiTopInfo: { marginBottom: 8 },
  aiName: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  aiTag: { fontSize: 11, color: '#FFD700', marginTop: 2 },
  aiBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  aiReview: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  aiReviewText: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  aiReviewCount: { fontSize: 11, color: TEXT_MID },
  aiChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 'auto',
    marginBottom: 8,
  },
  aiChatText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

  astroRow: { paddingHorizontal: 16, gap: 12 },
  astroHCard: {
    width: 160,
    height: 240,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  astroHImageWrap: {
    width: '100%',
    height: 120,
  },
  astroHImage: {
    width: '100%',
    height: '100%',
  },
  astroHInfo: { flex: 1, paddingHorizontal: 10, paddingTop: 6 },
  astroHName: { fontSize: 13, fontWeight: 'bold', color: TEXT_DARK },
  astroHSpec: { fontSize: 11, color: ACCENT, marginTop: 2 },
  astroHBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  astroHReview: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  astroHReviewText: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  astroHReviewCount: { fontSize: 11, color: TEXT_MID },
  astroHPrice: { fontSize: 11, fontWeight: '600', color: ACCENT },
  astroHChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  astroHChatText: { fontSize: 12, fontWeight: '600', color: '#FFF' },

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
