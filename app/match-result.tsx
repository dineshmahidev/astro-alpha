import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { computeKundli, type KundliResult } from '@/lib/astrology/kundli-engine';
import { computeMarriageTiming, type MarriageTimingResult } from '@/lib/astrology/marriage-timing';
import { PLACE_COORDS } from '@/constants/birth';

const BG = '#FFFFFF';
const CARD = 'rgba(245,245,245,1)';
const ACCENT = '#B09C66';
const ACCENT_DIM = 'rgba(176,156,102,0.12)';
const GREEN = '#7BD88F';
const ORANGE = '#FF9800';
const RED = '#EF5350';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#888888';
const BORDER = 'rgba(176,156,102,0.35)';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MatchResultScreen() {
  const router = useRouter();
  const { user, birthDetails, language: lang } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kundli, setKundli] = useState<KundliResult | null>(null);
  const [timing, setTiming] = useState<MarriageTimingResult | null>(null);
  const [error, setError] = useState('');

  const t = (key: string) => {
    const map: Record<string, Record<string, string>> = {
      'result.title': { en: 'Marriage Prediction', ta: 'திருமண கணிப்பு', hi: 'शादी भविष्यवाणी' },
      'result.dash': { en: 'Current Dasha Period', ta: 'தற்போதைய தசா காலம்', hi: 'वर्तमान दशा काल' },
      'result.venus': { en: 'Venus (Marriage)', ta: 'சுக்கிரன் (திருமணம்)', hi: 'शुक्र (विवाह)' },
      'result.jupiter': { en: 'Jupiter (Blessings)', ta: 'குரு (ஆசீர்வாதம்)', hi: 'गुरु (आशीर्वाद)' },
      'result.windows': { en: 'Probable Marriage Windows (3 Years)', ta: 'திருமண வாய்ப்புகள் (3 வருடம்)', hi: 'संभावित शादी की तिथियाँ (3 वर्ष)' },
      'result.doshas': { en: 'Dosha Analysis', ta: 'தோஷ பகுப்பாய்வு', hi: 'दोष विश्लेषण' },
      'result.recs': { en: 'Recommendations', ta: 'பரிந்துரைகள்', hi: 'सिफारिशें' },
      'result.high': { en: 'High Chance', ta: 'அதிக வாய்ப்பு', hi: 'अधिक संभावना' },
      'result.med': { en: 'Medium Chance', ta: 'சராசரி வாய்ப்பு', hi: 'मध्यम संभावना' },
      'result.low': { en: 'Low Chance', ta: 'குறைந்த வாய்ப்பு', hi: 'कम संभावना' },
    };
    return map[key]?.[lang] ?? map[key]?.['en'] ?? key;
  };

  useEffect(() => {
    console.log('[MatchResult] birthDetails:', JSON.stringify(birthDetails, null, 2));
    console.log('[MatchResult] user:', user?.name, user?.email);

    if (!birthDetails?.dobDate || !birthDetails?.tobDate) {
      console.log('[MatchResult] MISSING dobDate or tobDate');
      setError('Please complete your birth details in profile first');
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const utcOffset = -now.getTimezoneOffset() / 60;

      // Safe Date conversion — might be string from AsyncStorage
      const dobDate = birthDetails.dobDate instanceof Date ? birthDetails.dobDate : new Date(birthDetails.dobDate);
      const tobDate = birthDetails.tobDate instanceof Date ? birthDetails.tobDate : new Date(birthDetails.tobDate);

      console.log('[MatchResult] dobDate type:', typeof birthDetails.dobDate, '-> converted:', dobDate, 'valid:', !isNaN(dobDate.getTime()));
      console.log('[MatchResult] tobDate type:', typeof birthDetails.tobDate, '-> converted:', tobDate, 'valid:', !isNaN(tobDate.getTime()));
      console.log('[MatchResult] place:', birthDetails.place);

      if (isNaN(dobDate.getTime()) || isNaN(tobDate.getTime())) {
        console.log('[MatchResult] INVALID dates after conversion');
        setError('Invalid date format. Please update your birth details.');
        setLoading(false);
        return;
      }

      // Resolve place coordinates
      let lat = 13.0827, lon = 80.2707;
      const placeKey = (birthDetails.place ?? '').toLowerCase().split(',')[0].trim();
      const fallback = PLACE_COORDS[placeKey];
      if (fallback) { lat = fallback.lat; lon = fallback.lon; }
      console.log('[MatchResult] coords:', lat, lon, 'placeKey:', placeKey);

      console.log('[MatchResult] calling computeKundli...');
      const k = computeKundli({
        name: user?.name ?? 'User',
        date: dobDate,
        time: tobDate,
        place: birthDetails.place ?? '',
        lat, lon,
        utcOffset,
      });
      console.log('[MatchResult] kundli computed, doshas:', k.doshas.length);
      setKundli(k);

      console.log('[MatchResult] calling computeMarriageTiming...');
      const t = computeMarriageTiming(k);
      console.log('[MatchResult] timing computed, months:', t.probableMonths.length);
      setTiming(t);
    } catch (e) {
      console.error('[MatchResult] CALCULATION ERROR:', e);
      setError('Calculation failed. Please check your birth details.');
    } finally {
      setLoading(false);
    }
  }, [birthDetails, user]);

  if (loading) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safeTop} edges={['top']}>
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={s.loadingText}>Calculating your marriage prediction...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safeTop} edges={['top']}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{t('result.title')}</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={s.errorWrap}>
            <Ionicons name="warning" size={40} color={RED} />
            <Text style={s.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{t('result.title')}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Banner */}
          <View style={s.bannerWrap}>
            <ImageBackground
              source={require('../assets/match-banner.webp')}
              style={s.banner}
              imageStyle={s.bannerImage}
              contentFit="cover"
            >
              <View style={s.bannerOverlay}>
                <Text style={s.bannerTitle}>Marriage Prediction</Text>
                <Text style={s.bannerSub}>{user?.name ?? 'User'} • {birthDetails?.dob}</Text>
              </View>
            </ImageBackground>
          </View>

          {/* Dasha Card */}
          {timing && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="planet" size={20} color={ACCENT} />
                <Text style={s.cardTitle}>{t('result.dash')}</Text>
              </View>
              <View style={s.dashaRow}>
                <Text style={s.dashaLabel}>{t('result.dash')}</Text>
                <Text style={s.dashaValue}>{timing.currentDasha}</Text>
              </View>
              {timing.venusStatus ? (
                <View style={s.dashaRow}>
                  <Text style={s.dashaLabel}>{t('result.venus')}</Text>
                  <Text style={s.dashaValue}>{timing.venusStatus}</Text>
                </View>
              ) : null}
              {timing.jupiterStatus ? (
                <View style={s.dashaRow}>
                  <Text style={s.dashaLabel}>{t('result.jupiter')}</Text>
                  <Text style={s.dashaValue}>{timing.jupiterStatus}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* 3 Year Prediction */}
          {timing && timing.probableMonths.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="calendar" size={20} color={ACCENT} />
                <Text style={s.cardTitle}>{t('result.windows')}</Text>
              </View>

              {/* Group by year */}
              {[0, 1, 2].map((yearOffset) => {
                const now = new Date();
                const targetYear = now.getFullYear() + yearOffset;
                const yearMonths = timing.probableMonths.filter(m => m.year === targetYear);
                if (yearMonths.length === 0) return null;

                return (
                  <View key={yearOffset} style={s.yearSection}>
                    <Text style={s.yearTitle}>{targetYear}</Text>
                    {yearMonths.map((pm, i) => (
                      <View key={i} style={[s.monthRow, pm.confidence === 'High' && s.monthHigh]}>
                        <View style={[s.confDot, {
                          backgroundColor: pm.confidence === 'High' ? GREEN : pm.confidence === 'Medium' ? ORANGE : TEXT_DIM
                        }]} />
                        <Text style={s.monthName}>{pm.month}</Text>
                        <View style={[s.confBadge, {
                          backgroundColor: pm.confidence === 'High' ? GREEN + '20' : pm.confidence === 'Medium' ? ORANGE + '20' : TEXT_DIM + '20'
                        }]}>
                          <Text style={[s.confText, {
                            color: pm.confidence === 'High' ? GREEN : pm.confidence === 'Medium' ? ORANGE : TEXT_DIM
                          }]}>
                            {pm.confidence === 'High' ? t('result.high') : pm.confidence === 'Medium' ? t('result.med') : t('result.low')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {/* Doshas */}
          {kundli && kundli.doshas.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="warning" size={20} color={RED} />
                <Text style={s.cardTitle}>{t('result.doshas')}</Text>
              </View>
              {kundli.doshas.map((d, i) => (
                <View key={i} style={s.doshaRow}>
                  <View style={[s.doshaDot, {
                    backgroundColor: d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED
                  }]} />
                  <View style={s.doshaInfo}>
                    <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                    <Text style={s.doshaDetail}>{d.detail}</Text>
                  </View>
                  <Text style={[s.doshaStatus, {
                    color: d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED
                  }]}>{d.status}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {timing && timing.recommendations.length > 0 && (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Ionicons name="bulb" size={20} color={ACCENT} />
                <Text style={s.cardTitle}>{t('result.recs')}</Text>
              </View>
              {timing.recommendations.map((r, i) => (
                <View key={i} style={s.recRow}>
                  <Ionicons name="checkmark-circle" size={14} color={ACCENT} />
                  <Text style={s.recText}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  safeTop: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },

  // Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, color: TEXT_MID },

  // Error
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 32 },
  errorText: { fontSize: 14, color: RED, textAlign: 'center', lineHeight: 20 },

  // Banner
  bannerWrap: { marginBottom: 16 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 120 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Cards
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: TEXT_DARK },

  // Dasha
  dashaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dashaLabel: { fontSize: 12, color: TEXT_MID, fontWeight: '500' },
  dashaValue: { fontSize: 12, color: TEXT_DARK, fontWeight: '600', flex: 1, textAlign: 'right' },

  // Year Section
  yearSection: { marginTop: 10 },
  yearTitle: { fontSize: 16, fontWeight: '700', color: ACCENT, marginBottom: 8 },

  // Month Row
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6 },
  monthHigh: { backgroundColor: ACCENT_DIM },
  confDot: { width: 10, height: 10, borderRadius: 5 },
  monthName: { flex: 1, fontSize: 14, fontWeight: '600', color: TEXT_DARK },
  confBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  confText: { fontSize: 11, fontWeight: '700' },

  // Doshas
  doshaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  doshaDot: { width: 10, height: 10, borderRadius: 5 },
  doshaInfo: { flex: 1 },
  doshaName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  doshaDetail: { fontSize: 11, color: TEXT_MID, marginTop: 2, lineHeight: 16 },
  doshaStatus: { fontSize: 12, fontWeight: '700' },

  // Recommendations
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  recText: { flex: 1, fontSize: 12, color: TEXT_MID, lineHeight: 18 },
});
