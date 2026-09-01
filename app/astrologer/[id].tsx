import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ImageBackground, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/avatar';
import { VectorAvatar } from '@/components/vector-avatar';
import type { Astrologer } from '@/constants/astrologers';
import { supabase } from '@/lib/supabase';
import { uiStrings } from '@/constants/ui-strings';
import { useAuth } from '@/contexts/auth-context';
import { findOrCreateChat, recordPayment } from '@/lib/chat';

const ACCENT = '#B09C66';
const GREEN = '#7BD88F';
const CHAT_PRICE = 50;
const CALL_PRICE = 100;
const BACKGROUND_IMAGE = require('@/assets/images/background.png');

type Review = { id: string; name: string; rating: number; text: string; date: string };

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const REVIEWER_NAMES = [
  'Priya S.', 'Karthik M.', 'Anitha R.', 'Rajesh K.', 'Meena D.',
  'Vikram P.', 'Lakshmi N.', 'Suresh T.', 'Divya B.', 'Arun V.',
];

const REVIEW_TEMPLATES = [
  'Very accurate reading! {name} understood my situation perfectly and gave practical remedies.',
  'Good consultation. {name} explained my horoscope in detail and guided me well on career decisions.',
  'Excellent session. Really impressed with the accuracy. Will consult again!',
  'Helpful guidance on marriage compatibility. The remedies suggested were simple and effective.',
  'Best astrologer I have consulted. Very patient and explained everything clearly.',
  '{name} provided deep insights into my kundli. The predictions were spot on!',
  'Great experience overall. {name} was very knowledgeable about Vedic astrology.',
  'Satisfied with the palm reading. {name} identified issues I had not mentioned.',
  '{name} gave me practical remedies that actually worked. Highly recommend!',
  'Professional and accurate. {name} helped me make important life decisions with clarity.',
];

const REVIEW_DATES = [
  '2 days ago', '4 days ago', '1 week ago', '2 weeks ago', '3 weeks ago',
  '1 month ago', '1 month ago', '2 months ago', '3 months ago', '6 months ago',
];

function generateReviews(id: string): Review[] {
  const seed = simpleHash(id ?? 'a1');
  return Array.from({ length: 5 }, (_, i) => {
    const hash = simpleHash(`${seed}-${i}`);
    return {
      id: `${i + 1}`,
      name: REVIEWER_NAMES[hash % REVIEWER_NAMES.length],
      rating: (hash % 2) + 4,
      text: REVIEW_TEMPLATES[hash % REVIEW_TEMPLATES.length].replace('{name}', 'the astrologer'),
      date: REVIEW_DATES[(hash + i) % REVIEW_DATES.length],
    };
  });
}

export default function AstrologerPortfolioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, language } = useAuth();
  const t = uiStrings(language).t;
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [astro, setAstro] = useState<Astrologer | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('astrologers').select('*').eq('id', id).single();
      if (data) setAstro(data as Astrologer);
    })();
  }, [id]);

  const reviews = useMemo(() => generateReviews(id ?? 'a1'), [id]);

  const startPaidChat = () => {
    if (!user?.email) {
      Alert.alert('Sign in', 'Please sign in to start a paid consultation.');
      return;
    }
    Alert.alert(
      'Paid Consultation',
      `Start a live chat with ${astro?.name} for ₹${CHAT_PRICE}? The astrologer will see your birth chart for an accurate reading.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ₹${CHAT_PRICE} & Chat`,
          onPress: async () => {
            setPaying(true);
            const chat = await findOrCreateChat(user.email!, astro?.id ?? 'a1');
            if (!chat) {
              setPaying(false);
              Alert.alert('Error', 'Could not start the consultation. Please try again.');
              return;
            }
            await recordPayment({
              user_email: user.email!,
              astrologer_id: astro?.id ?? 'a1',
              chat_id: chat.id,
              amount: CHAT_PRICE,
            });
            setPaying(false);
            router.push({ pathname: '/chat-room/[id]', params: { id: chat.id } });
          },
        },
      ],
    );
  };

  const paidCall = () => {
    Alert.alert('Paid Call', 'This is a paid consultation. Pay ₹100/min to continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Pay & Call',
        onPress: () => {
          const digits = (astro?.mobile ?? '').replace(/[^0-9]/g, '');
          Linking.openURL(`tel:${digits}`);
        },
      },
    ]);
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Ionicons key={i} name={i < count ? 'star' : 'star-outline'} size={13} color="#FFB800" />
    ));

  return (
    <ThemedView style={styles.screen}>
      <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} imageStyle={styles.bgImg} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}>
          <View style={styles.hero}>
            <Avatar uri={astro?.avatar} name={astro?.name ?? 'A'} size={100} color={astro?.avatarColor} style={{ borderWidth: 3, borderColor: ACCENT }} />
            <ThemedText style={styles.name}>{astro?.name}</ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <ThemedText style={styles.rating}>{astro?.rating} Rating</ThemedText>
              <ThemedText style={styles.reviewCount}>({reviews.length} reviews)</ThemedText>
            </View>
            <ThemedText style={styles.specialty}>{astro?.specialty}</ThemedText>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={15} color={ACCENT} />
                <ThemedText style={styles.metaText}>{astro?.location}</ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase" size={15} color={ACCENT} />
                <ThemedText style={styles.metaText}>{astro?.experience}</ThemedText>
              </View>
            </View>
          </View>

          {/* ── TABS ── */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, activeTab === 'about' && styles.tabActive]} onPress={() => setActiveTab('about')}>
              <ThemedText style={[styles.tabTxt, activeTab === 'about' && styles.tabTxtActive]}>About</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'reviews' && styles.tabActive]} onPress={() => setActiveTab('reviews')}>
              <ThemedText style={[styles.tabTxt, activeTab === 'reviews' && styles.tabTxtActive]}>Reviews ({reviews.length})</ThemedText>
            </TouchableOpacity>
          </View>

          {/* ── ABOUT TAB ── */}
          {activeTab === 'about' && (
            <>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>About</ThemedText>
                <ThemedText style={styles.bio}>{astro?.bio}</ThemedText>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={18} color="#FFB800" />
                  <ThemedText style={styles.statValue}>{astro?.rating}</ThemedText>
                  <ThemedText style={styles.statLabel}>Rating</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="briefcase" size={18} color={ACCENT} />
                  <ThemedText style={styles.statValue}>{astro?.experience}</ThemedText>
                  <ThemedText style={styles.statLabel}>Experience</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="chatbubbles" size={18} color={GREEN} />
                  <ThemedText style={styles.statValue}>{reviews.length * 12}+</ThemedText>
                  <ThemedText style={styles.statLabel}>Consultations</ThemedText>
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Services</ThemedText>
                <View style={styles.chips}>
                  {astro?.specialty.split(', ').map((s) => (
                    <View key={s} style={styles.chip}>
                      <ThemedText style={styles.chipText}>{s}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Languages</ThemedText>
                <View style={styles.chips}>
                  {['English', 'Tamil', 'Hindi'].map((lang) => (
                    <View key={lang} style={styles.chip}>
                      <ThemedText style={styles.chipText}>{lang}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ── REVIEWS TAB ── */}
          {activeTab === 'reviews' && (
            <View style={styles.section}>
              {reviews.map((r) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <VectorAvatar name={r.name} size={38} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.reviewName}>{r.name}</ThemedText>
                      <View style={styles.reviewStars}>{renderStars(r.rating)}</View>
                    </View>
                    <ThemedText style={styles.reviewDate}>{r.date}</ThemedText>
                  </View>
                  <ThemedText style={styles.reviewText}>{r.text}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.pricingRow}>
            <ThemedText style={styles.pricingText}>₹{CHAT_PRICE}/chat session</ThemedText>
            <ThemedText style={styles.pricingText}>₹{CALL_PRICE}/min for calls</ThemedText>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.chatBtn]} disabled={paying} onPress={startPaidChat}>
              <Ionicons name="chatbubble" size={18} color="#ffffff" />
              <ThemedText style={styles.btnText}>{paying ? 'Starting…' : t('home.chat')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.callBtn]} onPress={paidCall}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <ThemedText style={styles.btnText}>Call</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  bgImg: { resizeMode: 'cover', opacity: 0.5 },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 14 },
  heroAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1D1D1C', borderWidth: 3, borderColor: ACCENT },
  name: { fontSize: 21, fontWeight: 'bold', color: '#EEEDE0', marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, color: '#7E7E78' },
  reviewCount: { fontSize: 12, color: '#555' },
  specialty: { fontSize: 13, color: ACCENT, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 18, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12.5, color: '#7E7E78' },

  /* tabs */
  tabRow: { flexDirection: 'row', marginTop: 18, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#1D1D1C' },
  tabActive: { backgroundColor: ACCENT },
  tabTxt: { fontSize: 14, fontWeight: '600', color: '#7E7E78' },
  tabTxtActive: { color: '#fff' },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', marginBottom: 8 },
  bio: { fontSize: 13.5, color: '#7E7E78', lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: '#292723', borderRadius: 12, paddingVertical: 5, paddingHorizontal: 12 },
  chipText: { fontSize: 12.5, color: '#EEEDE0' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1C',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(176,156,102,0.25)',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#EEEDE0' },
  statLabel: { fontSize: 11, color: '#7E7E78' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(176,156,102,0.2)' },

  /* reviews */
  reviewCard: { backgroundColor: '#1D1D1C', borderRadius: 12, padding: 12, marginBottom: 10 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  reviewName: { fontSize: 13, fontWeight: '600', color: '#EEEDE0' },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 1 },
  reviewDate: { fontSize: 11, color: '#555' },
  reviewText: { fontSize: 13, color: '#7E7E78', lineHeight: 19 },

  /* bottom bar */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    gap: 8, padding: 16, paddingTop: 12,
    backgroundColor: '#1D1D1C', borderTopWidth: 1, borderTopColor: '#444039',
  },
  pricingRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  pricingText: { fontSize: 12, color: '#7E7E78' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, paddingVertical: 13 },
  chatBtn: { backgroundColor: '#292723' },
  callBtn: { backgroundColor: ACCENT },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
