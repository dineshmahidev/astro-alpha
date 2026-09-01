import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getNakshatraName, getRashiName, PADA_LABELS } from '@/constants/i18n';
import { uiStrings } from '@/constants/ui-strings';
import { isAstrologer, useAuth } from '@/contexts/auth-context';
import { computeAstroReport, computeDailyHoroscope } from '@/lib/pipeline';

const ACCENT = '#B09C66';

const PLANET_LABELS: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
  Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu',
};

const PLANET_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Sun: 'sunny', Moon: 'moon', Mars: 'flame', Mercury: 'chatbubble',
  Jupiter: 'sparkles', Venus: 'heart', Saturn: 'time', Rahu: 'cloud', Ketu: 'cloudy',
};

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const RAHU_KALAM_START: Record<number, string> = {
  0: '16:30', 1: '07:30', 2: '15:00', 3: '12:00', 4: '13:30', 5: '10:30', 6: '09:00',
};
const GULIKAI_START: Record<number, string> = {
  0: '15:00', 1: '13:30', 2: '12:00', 3: '10:30', 4: '09:00', 5: '07:30', 6: '06:00',
};

function fmtTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function addHalfHour(time: string): string {
  let [h, m] = time.split(':').map(Number);
  m += 30;
  if (m >= 60) { h += 1; m -= 60; }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fmtDeg(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}° ${String(m).padStart(2, '0')}'`;
}

export default function JathagamScreen() {
  const router = useRouter();
  const { birthDetails, language, role } = useAuth();
  const canSeeCalculations = isAstrologer(role);
  const t = uiStrings(language).t;
  const scrollRef = useRef<ScrollView>(null);

  const sectionRefs = useRef<Record<string, number>>({});
  const sectionLayouts: { key: string; label: string; y: number }[] = [];

  const today = new Date();
  const dayOfWeek = today.getDay();
  const rahuStart = RAHU_KALAM_START[dayOfWeek];
  const gulikaiStart = GULIKAI_START[dayOfWeek];
  const rahuKalam = `${fmtTime(rahuStart)} – ${fmtTime(addHalfHour(rahuStart))}`;
  const gulikaiTime = `${fmtTime(gulikaiStart)} – ${fmtTime(addHalfHour(gulikaiStart))}`;

  const birthDate = birthDetails
    ? birthDetails.tobKnown && birthDetails.tobDate
      ? birthDetails.tobDate
      : birthDetails.dobDate
    : null;

  const report = useMemo(() => {
    if (!birthDate) return null;
    try {
      return computeAstroReport({ birthDate, place: birthDetails?.place });
    } catch (e) {
      console.warn('[Jathagam] compute failed', e);
      return null;
    }
  }, [birthDate, birthDetails?.place]);

  const daily = useMemo(() => {
    if (!birthDate) return null;
    try {
      return computeDailyHoroscope({ birthDate, place: birthDetails?.place }, new Date());
    } catch (e) {
      console.warn('[Jathagam] daily failed', e);
      return null;
    }
  }, [birthDate, birthDetails?.place]);

  const displayName = birthDetails?.name ?? 'Aarav Sharma';
  const displayDetails = birthDetails
    ? `${birthDetails.dob} · ${birthDetails.tobKnown ? birthDetails.tob : 'Time unknown'} · ${birthDetails.place}`
    : '15/08/1996 · 09:45 · Mumbai';
  const rashiName = report ? getRashiName(language, report.moonRashiIndex) : '—';
  const nakshatraName = report ? getNakshatraName(language, report.moonNakshatraIndex) : '—';
  const pada = report ? `Pada ${report.moonPada}` : '—';
  const lagnaName = report?.lagna ? getRashiName(language, report.lagna.rashiIndex) : '—';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#EEEDE0" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Jathagam</ThemedText>
        </View>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <ThemedText style={styles.jumpLabel}>{t('jathagam.sectionJump')}</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.jumpRow}>
            {[
              { key: 'profile', label: 'Profile' },
              { key: 'daily', label: 'Daily Horoscope' },
              { key: 'dosha', label: 'Sarpa Dosha' },
              ...(canSeeCalculations
                ? [
                    { key: 'planets', label: 'Planets' },
                    { key: 'houses', label: 'Houses' },
                    { key: 'navamsa', label: 'Navamsa' },
                    { key: 'dasha', label: 'Dasha' },
                    { key: 'panchanga', label: 'Panchanga' },
                  ]
                : []),
              { key: 'rahukalam', label: t('jathagam.rahuKalam') },
            ].map((s) => (
              <TouchableOpacity
                key={s.key}
                style={styles.jumpPill}
                onPress={() => {
                  const y = sectionRefs.current[s.key];
                  if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
                }}>
                <ThemedText style={styles.jumpPillText}>{s.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View
            style={styles.reportCard}
            onLayout={(e) => { sectionRefs.current['profile'] = e.nativeEvent.layout.y; }}>
            <View style={styles.avatarRow}>
              <Ionicons name="person-circle" size={44} color={ACCENT} />
              <View>
                <ThemedText style={styles.name}>{displayName}</ThemedText>
                <ThemedText style={styles.details}>{displayDetails}</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Lagna</ThemedText>
                <ThemedText style={styles.statValue}>{lagnaName}</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Rashi</ThemedText>
                <ThemedText style={styles.statValue}>{rashiName}</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>Nakshatra</ThemedText>
                <ThemedText style={styles.statValue}>{nakshatraName}</ThemedText>
              </View>
              <View style={styles.stat}>
                <ThemedText style={styles.statLabel}>{PADA_LABELS[language]}</ThemedText>
                <ThemedText style={styles.statValue}>{pada}</ThemedText>
              </View>
            </View>
          </View>

          <View onLayout={(e) => { sectionRefs.current['daily'] = e.nativeEvent.layout.y; }}>
          <SectionTitle icon="sunny-outline" text="Daily Horoscope" />
          <View style={styles.card}>
            {daily ? (
              <View>
                {(
                  [
                    ['Career', 'Career'],
                    ['Finance', 'Finance'],
                    ['Relationship', 'Relationship'],
                    ['Family', 'Family'],
                    ['Travel', 'Travel'],
                    ['General', 'General'],
                  ] as const
                ).map(([key, label]) => (
                  <View key={key} style={styles.categoryRow}>
                    <ThemedText style={styles.categoryLabel}>{label}</ThemedText>
                    <ThemedText style={styles.categoryText}>
                      {daily.horoscope.categories[key]}
                    </ThemedText>
                  </View>
                ))}
                <View style={styles.luckyRow}>
                  <Ionicons name="star" size={14} color={ACCENT} />
                  <ThemedText style={styles.luckyText}>
                    Lucky window: {daily.horoscope.luckyPeriod}
                  </ThemedText>
                </View>
              </View>
            ) : (
              <ThemedText style={styles.empty}>No birth data yet.</ThemedText>
            )}
          </View>
          </View>

          <View onLayout={(e) => { sectionRefs.current['dosha'] = e.nativeEvent.layout.y; }}>
          <SectionTitle icon="bug-outline" text="Sarpa Dosha" />
          <View
            style={[
              styles.card,
              report?.nodalDosha.present && styles.doshaCardActive,
            ]}>
            {report?.nodalDosha.present ? (
              <View>
                <View style={styles.doshaHeader}>
                  <Ionicons
                    name={report.nodalDosha.severity === 'Severe' ? 'warning' : 'alert-circle'}
                    size={18}
                    color={ACCENT}
                  />
                  <ThemedText style={styles.doshaTitle}>{report.nodalDosha.name}</ThemedText>
                </View>
                <View style={styles.doshaSeverityRow}>
                  <ThemedText style={styles.doshaSeverityLabel}>Severity</ThemedText>
                  <ThemedText
                    style={[
                      styles.doshaSeverity,
                      report.nodalDosha.severity === 'Severe' && styles.doshaSeveritySevere,
                      report.nodalDosha.severity === 'Moderate' && styles.doshaSeverityModerate,
                    ]}>
                    {report.nodalDosha.severity}
                  </ThemedText>
                </View>
                {canSeeCalculations &&
                  report.nodalDosha.details.map((d, i) => (
                    <View key={i} style={styles.doshaDetailRow}>
                      <Ionicons name="chevron-forward" size={14} color="#7E7E78" />
                      <ThemedText style={styles.doshaDetail}>{d}</ThemedText>
                    </View>
                  ))}
                <ThemedText style={styles.doshaRemedyTitle}>Suggested remedies</ThemedText>
                {report.nodalDosha.remedies.map((r, i) => (
                  <View key={i} style={styles.doshaDetailRow}>
                    <Ionicons name="sparkles" size={14} color={ACCENT} />
                    <ThemedText style={styles.doshaRemedy}>{r}</ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <View>
                <View style={styles.doshaHeader}>
                  <Ionicons name="shield-checkmark" size={18} color="#5BA867" />
                  <ThemedText style={styles.doshaTitle}>No Sarpa Dosha</ThemedText>
                </View>
                <ThemedText style={styles.doshaDetail}>
                  Rahu and Ketu are not placed in the sensitive houses (1, 2, 4, 5, 7, 8, 9, 12) from
                  either the Lagna or the Moon sign, and the planets are not enclosed by the Rahu–Ketu
                  axis. Your chart is free of serpent dosha.
                </ThemedText>
              </View>
            )}
            {canSeeCalculations && report?.nodalDosha && (
              <View style={styles.doshaNodes}>
                <View style={styles.doshaNode}>
                  <ThemedText style={styles.doshaNodeLabel}>
                    Rahu · {report.nodalDosha.rahu.sign} ·{' '}
                    {report.nodalDosha.rahu.nakshatra} Pada {report.nodalDosha.rahu.pada}
                  </ThemedText>
                  <ThemedText style={styles.doshaNodeHouse}>
                    House {report.nodalDosha.rahu.houseFromLagna} from Lagna · House{' '}
                    {report.nodalDosha.rahu.houseFromMoon} from Moon
                  </ThemedText>
                </View>
                <View style={styles.doshaNode}>
                  <ThemedText style={styles.doshaNodeLabel}>
                    Ketu · {report.nodalDosha.ketu.sign} ·{' '}
                    {report.nodalDosha.ketu.nakshatra} Pada {report.nodalDosha.ketu.pada}
                  </ThemedText>
                  <ThemedText style={styles.doshaNodeHouse}>
                    House {report.nodalDosha.ketu.houseFromLagna} from Lagna · House{' '}
                    {report.nodalDosha.ketu.houseFromMoon} from Moon
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
          </View>

          {canSeeCalculations && (
            <>
              <View onLayout={(e) => { sectionRefs.current['planets'] = e.nativeEvent.layout.y; }}>
              <SectionTitle icon="planet-outline" text="Planetary Positions" />
              <View style={styles.card}>
                {report?.planets.map((p) => {
                  const rashi = getRashiName(language, Math.floor(p.siderealLongitude / 30) % 12);
                  const nakIdx = Math.floor(p.siderealLongitude / (360 / 27)) % 27;
                  const nak = getNakshatraName(language, nakIdx);
                  const pada = Math.floor((p.siderealLongitude % (360 / 27)) / ((360 / 27) / 4)) + 1;
                  return (
                    <View key={p.key} style={styles.planetRow}>
                      <View style={styles.planetLeft}>
                        <View style={styles.planetIcon}>
                          <Ionicons name={PLANET_ICONS[p.key] ?? 'star'} size={16} color="#1D1D1C" />
                        </View>
                        <View>
                          <ThemedText style={styles.planetName}>
                            {PLANET_LABELS[p.key]}
                            {p.retrograde ? <ThemedText style={styles.retro}> (R)</ThemedText> : null}
                          </ThemedText>
                          <ThemedText style={styles.planetSub}>
                            {rashi} · {nak} · Pada {pada}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText style={styles.planetDeg}>
                        {fmtDeg(p.siderealLongitude)}
                      </ThemedText>
                    </View>
                  );
                }) ?? <ThemedText style={styles.empty}>No birth data yet.</ThemedText>}
              </View>
              </View>

              <View onLayout={(e) => { sectionRefs.current['houses'] = e.nativeEvent.layout.y; }}>
              <SectionTitle icon="home-outline" text="Bhava (Houses)" />
              <View style={styles.card}>
                {report?.houses.map((h) => (
                  <View key={h.houseNumber} style={styles.houseRow}>
                    <View style={styles.houseBadge}>
                      <ThemedText style={styles.houseBadgeText}>{h.houseNumber}</ThemedText>
                    </View>
                    <View style={styles.houseInfo}>
                      <ThemedText style={styles.houseName}>
                        {getRashiName(language, h.rashiIndex)}
                        <ThemedText style={styles.houseLord}> · Lord {PLANET_LABELS[h.lord]}</ThemedText>
                      </ThemedText>
                      <ThemedText style={styles.houseSub}>
                        {h.planets.length > 0 ? h.planets.map((pl) => PLANET_LABELS[pl]).join(', ') : '—'}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.houseDeg}>{fmtDeg(h.startDeg)}</ThemedText>
                  </View>
                )) ?? null}
              </View>
              </View>

              <View onLayout={(e) => { sectionRefs.current['navamsa'] = e.nativeEvent.layout.y; }}>
              <SectionTitle icon="git-branch-outline" text="Navamsa (D9)" />
              <View style={styles.card}>
                {report?.navamsa ? (
                  report.planets.map((p) => {
                    const nav = report.navamsa!.planets[p.key];
                    return (
                      <View key={p.key} style={styles.navamsaRow}>
                        <ThemedText style={styles.navamsaPlanet}>{PLANET_LABELS[p.key]}</ThemedText>
                        <ThemedText style={styles.navamsaSign}>{getRashiName(language, nav.navamsaSignIndex)}</ThemedText>
                        <ThemedText style={styles.navamsaDeg}>{fmtDeg(nav.degreeInNavamsa)}</ThemedText>
                      </View>
                    );
                  })
                ) : (
                  <ThemedText style={styles.empty}>No birth data yet.</ThemedText>
                )}
              </View>
              </View>

              <View onLayout={(e) => { sectionRefs.current['dasha'] = e.nativeEvent.layout.y; }}>
              <SectionTitle icon="time-outline" text="Vimshottari Mahadasha" />
              <View style={styles.card}>
                {report?.dasha ? (
                  DASHA_ORDER.map((lord) => {
                    const period = report.dasha.mahadashas.find((m) => m.lord === lord);
                    if (!period) return null;
                    const active = report.dasha.birthMahadasha.lord === lord;
                    return (
                      <View
                        key={lord}
                        style={[styles.dashaRow, active && styles.dashaRowActive]}>
                        <View style={styles.dashaLeft}>
                          <View style={[styles.dashaDot, active && styles.dashaDotActive]} />
                          <ThemedText style={styles.dashaPlanet}>{PLANET_LABELS[lord]}</ThemedText>
                        </View>
                        <View style={styles.dashaDates}>
                          <ThemedText style={styles.dashaYears}>{period.years} yrs</ThemedText>
                          <ThemedText style={styles.dashaDate}>
                            {period.startDate.split(' ')[0]} → {period.endDate.split(' ')[0]}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <ThemedText style={styles.empty}>No birth data yet.</ThemedText>
                )}
              </View>
              </View>

              <View onLayout={(e) => { sectionRefs.current['panchanga'] = e.nativeEvent.layout.y; }}>
              <SectionTitle icon="calendar-outline" text="Panchanga" />
              <View style={styles.card}>
                {report?.birthPanchanga ? (
                  <View>
                    <InfoRow label="Tithi" value={report.birthPanchanga.tithiName} />
                    <InfoRow label="Paksha" value={report.birthPanchanga.paksha} />
                    <InfoRow label="Vara" value={report.birthPanchanga.varaName} />
                    <InfoRow label="Nakshatra" value={report.birthPanchanga.nakshatra} />
                    <InfoRow label="Yoga" value={report.birthPanchanga.yogaName} />
                    <InfoRow label="Karana" value={report.birthPanchanga.karanaName} />
                  </View>
                ) : (
                  <ThemedText style={styles.empty}>No birth data yet.</ThemedText>
                )}
              </View>
              </View>
            </>
          )}

          <View onLayout={(e) => { sectionRefs.current['rahukalam'] = e.nativeEvent.layout.y; }}>
          <SectionTitle icon="time-outline" text={t('jathagam.rahuKalam')} />
          <View style={[styles.card, styles.goldCard]}>
            <View style={styles.rahuRow}>
              <View style={styles.rahuLeft}>
                <Ionicons name="moon-outline" size={20} color={ACCENT} />
                <ThemedText style={styles.rahuLabel}>{t('jathagam.rahuKalam')}</ThemedText>
              </View>
              <ThemedText style={styles.rahuTime}>{rahuKalam}</ThemedText>
            </View>
            <View style={styles.rahuDivider} />
            <View style={styles.rahuRow}>
              <View style={styles.rahuLeft}>
                <Ionicons name="cloudy-night-outline" size={20} color={ACCENT} />
                <ThemedText style={styles.rahuLabel}>{t('jathagam.gulikai')}</ThemedText>
              </View>
              <ThemedText style={styles.rahuTime}>{gulikaiTime}</ThemedText>
            </View>
          </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function SectionTitle({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={18} color={ACCENT} />
      <ThemedText style={styles.sectionTitle}>{text}</ThemedText>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#121212' },
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#EEEDE0', marginLeft: 4 },
  content: { padding: 16, paddingBottom: 40 },
  reportCard: {
    backgroundColor: '#1D1D1C',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,240,200,0.35)',
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#EEEDE0' },
  details: { fontSize: 13, color: '#7E7E78', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#7E7E78' },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#EEEDE0', marginTop: 2 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#EEEDE0' },
  card: {
    backgroundColor: '#1D1D1C',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,240,200,0.35)',
  },
  empty: { color: '#7E7E78', textAlign: 'center', paddingVertical: 16 },
  doshaCardActive: { borderColor: 'rgba(176,156,102,0.6)' },
  doshaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  doshaTitle: { fontSize: 16, fontWeight: 'bold', color: '#EEEDE0', flex: 1 },
  doshaSeverityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
    marginBottom: 6,
  },
  doshaSeverityLabel: { fontSize: 13, color: '#7E7E78' },
  doshaSeverity: { fontSize: 13, fontWeight: 'bold', color: '#5BA867' },
  doshaSeverityModerate: { color: '#D9A13B' },
  doshaSeveritySevere: { color: '#E56B6F' },
  doshaDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  doshaDetail: { flex: 1, fontSize: 13, color: '#7E7E78', lineHeight: 19 },
  doshaRemedyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: ACCENT,
    marginTop: 6,
    marginBottom: 6,
  },
  doshaRemedy: { flex: 1, fontSize: 13, color: '#7E7E78', lineHeight: 19 },
  doshaNodes: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444039',
    gap: 8,
  },
  doshaNode: { gap: 2 },
  doshaNodeLabel: { fontSize: 13, fontWeight: '600', color: '#EEEDE0' },
  doshaNodeHouse: { fontSize: 12, color: '#7E7E78' },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  planetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetName: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  retro: { color: '#E56B6F', fontSize: 13 },
  planetSub: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  planetDeg: { fontSize: 14, color: ACCENT, fontWeight: '600' },
  houseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  houseBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseBadgeText: { color: '#1D1D1C', fontWeight: 'bold', fontSize: 13 },
  houseInfo: { flex: 1 },
  houseName: { fontSize: 14, fontWeight: '600', color: '#EEEDE0' },
  houseLord: { fontSize: 12, color: '#7E7E78', fontWeight: '400' },
  houseSub: { fontSize: 12, color: '#7E7E78', marginTop: 1 },
  houseDeg: { fontSize: 12, color: ACCENT },
  navamsaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  navamsaPlanet: { fontSize: 14, fontWeight: '600', color: '#EEEDE0', width: 90 },
  navamsaSign: { flex: 1, fontSize: 14, color: '#7E7E78' },
  navamsaDeg: { fontSize: 13, color: ACCENT },
  dashaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  dashaRowActive: { backgroundColor: 'rgba(176,156,102,0.12)', borderRadius: 8 },
  dashaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dashaDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#444039' },
  dashaDotActive: { backgroundColor: ACCENT },
  dashaPlanet: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  dashaDates: { alignItems: 'flex-end' },
  dashaYears: { fontSize: 14, fontWeight: 'bold', color: ACCENT },
  dashaDate: { fontSize: 11, color: '#7E7E78', marginTop: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444039',
  },
  infoLabel: { fontSize: 14, color: '#7E7E78' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#EEEDE0' },
  categoryRow: { marginBottom: 10 },
  categoryLabel: { fontSize: 14, fontWeight: 'bold', color: ACCENT, marginBottom: 2 },
  categoryText: { fontSize: 13, color: '#7E7E78', lineHeight: 19 },
  luckyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#444039',
  },
  luckyText: { fontSize: 13, color: '#EEEDE0', fontWeight: '600' },
  jumpLabel: { fontSize: 13, color: '#7E7E78', marginBottom: 6 },
  jumpRow: { gap: 8, marginBottom: 16 },
  jumpPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1D1D1C',
    borderWidth: 1,
    borderColor: 'rgba(255,240,200,0.35)',
  },
  jumpPillText: { fontSize: 13, fontWeight: '600', color: ACCENT },
  goldCard: {
    borderColor: ACCENT,
    borderWidth: 1.5,
    backgroundColor: 'rgba(176,156,102,0.08)',
  },
  rahuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rahuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rahuLabel: { fontSize: 15, fontWeight: '600', color: '#EEEDE0' },
  rahuTime: { fontSize: 15, fontWeight: 'bold', color: ACCENT },
  rahuDivider: {
    height: 1,
    backgroundColor: 'rgba(176,156,102,0.3)',
    marginVertical: 4,
  },
});