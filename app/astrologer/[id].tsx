import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
const CARD_BG = 'rgba(245,245,245,1)';
const BORDER = 'rgba(176,156,102,0.35)';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

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
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}>
          <View style={styles.hero}>
            <Avatar uri={astro?.avatar} name={astro?.name ?? 'A'} size={100} color={astro?.avatarColor} style={{ borderWidth: 3, borderColor: ACCENT }} />
            <Text style={styles.name}>{astro?.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.rating}>{astro?.rating} Rating</Text>
              <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
            </View>
            <Text style={styles.specialty}>{astro?.specialty}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={15} color={ACCENT} />
                <Text style={styles.metaText}>{astro?.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase" size={15} color={ACCENT} />
                <Text style={styles.metaText}>{astro?.experience}</Text>
              </View>
            </View>
          </View>

          {/* ── TABS ── */}
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, activeTab === 'about' && styles.tabActive]} onPress={() => setActiveTab('about')}>
              <Text style={[styles.tabTxt, activeTab === 'about' && styles.tabTxtActive]}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'reviews' && styles.tabActive]} onPress={() => setActiveTab('reviews')}>
              <Text style={[styles.tabTxt, activeTab === 'reviews' && styles.tabTxtActive]}>Reviews ({reviews.length})</Text>
            </TouchableOpacity>
          </View>

          {/* ── ABOUT TAB ── */}
          {activeTab === 'about' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.bio}>{astro?.bio}</Text>
              </View>

              {/* Quick Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={18} color="#FFB800" />
                  <Text style={styles.statValue}>{astro?.rating}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="briefcase" size={18} color={ACCENT} />
                  <Text style={styles.statValue}>{astro?.experience}</Text>
                  <Text style={styles.statLabel}>Experience</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="chatbubbles" size={18} color={GREEN} />
                  <Text style={styles.statValue}>{reviews.length * 12}+</Text>
                  <Text style={styles.statLabel}>Consultations</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                <View style={styles.chips}>
                  {astro?.specialty.split(', ').map((s) => (
                    <View key={s} style={styles.chip}>
                      <Text style={styles.chipText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <View style={styles.chips}>
                  {['English', 'Tamil', 'Hindi'].map((lang) => (
                    <View key={lang} style={styles.chip}>
                      <Text style={styles.chipText}>{lang}</Text>
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
                      <Text style={styles.reviewName}>{r.name}</Text>
                      <View style={styles.reviewStars}>{renderStars(r.rating)}</View>
                    </View>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingText}>₹{CHAT_PRICE}/chat session</Text>
            <Text style={styles.pricingText}>₹{CALL_PRICE}/min for calls</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.chatBtn]} disabled={paying} onPress={startPaidChat}>
              <Ionicons name="chatbubble" size={18} color="#ffffff" />
              <Text style={styles.btnText}>{paying ? 'Starting…' : t('home.chat')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.callBtn]} onPress={paidCall}>
              <Ionicons name="call" size={18} color="#ffffff" />
              <Text style={styles.btnText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK, marginLeft: 4 },
  content: { padding: 16 },
  hero: { alignItems: 'center', paddingVertical: 14 },
  heroAvatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: CARD_BG, borderWidth: 3, borderColor: ACCENT },
  name: { fontSize: 21, fontWeight: 'bold', color: TEXT_DARK, marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 14, color: TEXT_MID },
  reviewCount: { fontSize: 12, color: TEXT_MID },
  specialty: { fontSize: 13, color: ACCENT, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 18, marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12.5, color: TEXT_MID },

  /* tabs */
  tabRow: { flexDirection: 'row', marginTop: 18, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER },
  tabActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  tabTxt: { fontSize: 14, fontWeight: '600', color: TEXT_MID },
  tabTxtActive: { color: '#fff' },

  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 8 },
  bio: { fontSize: 13.5, color: TEXT_MID, lineHeight: 21 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: CARD_BG, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: BORDER },
  chipText: { fontSize: 12.5, color: TEXT_DARK },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: TEXT_DARK },
  statLabel: { fontSize: 11, color: TEXT_MID },
  statDivider: { width: 1, height: 30, backgroundColor: BORDER },

  /* reviews */
  reviewCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: BORDER },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  reviewName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 1 },
  reviewDate: { fontSize: 11, color: TEXT_MID },
  reviewText: { fontSize: 13, color: TEXT_MID, lineHeight: 19 },

  /* bottom bar */
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    gap: 8, padding: 16, paddingTop: 12,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER,
  },
  pricingRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  pricingText: { fontSize: 12, color: TEXT_MID },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, paddingVertical: 13 },
  chatBtn: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: BORDER },
  callBtn: { backgroundColor: ACCENT },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});
