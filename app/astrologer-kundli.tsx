import { ImageBackground } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
  Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { computeKundli, type KundliResult, type PlanetDetail } from '@/lib/astrology/kundli-engine';
import { ZODIAC_SIGNS } from '@/constants/zodiac';
import { PLACE_COORDS } from '@/constants/birth';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Theme (matching Astrologer Home) ────────────────────────────

const BG = '#FFFFFF';
const CARD = 'rgba(245,245,245,1)';
const CARD_LIGHT = '#F0EDE4';
const ACCENT = '#B09C66';
const ACCENT_DIM = 'rgba(176,156,102,0.12)';
const GREEN = '#7BD88F';
const ORANGE = '#FF9800';
const RED = '#EF5350';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';
const TEXT_DIM = '#888888';
const BORDER = 'rgba(176,156,102,0.35)';
const CHART_BG = '#0D0D14';
const CHART_BORDER = 'rgba(176,156,102,0.5)';

// ─── Place Autocomplete ─────────────────────────────────────────

type PlaceResult = { name: string; lat: number; lon: number };

const searchPlace = async (query: string): Promise<PlaceResult[]> => {
  if (query.length < 3) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
    const data = await res.json();
    return data.map((item: any) => ({ name: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) }));
  } catch { return []; }
};

// ─── Planet symbols ─────────────────────────────────────────────

const SYM: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿', Jupiter: '♃',
  Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்கிரன்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது',
};

const PLANETS_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

// ─── Component ──────────────────────────────────────────────────

export default function AstrologerKundliScreen() {
  const router = useRouter();

  // Input state
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 1));
  const [birthTime, setBirthTime] = useState(new Date(1990, 0, 1, 10, 30));
  const [place, setPlace] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Result
  const [result, setResult] = useState<KundliResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Expandable sections
  const [expanded, setExpanded] = useState<string | null>(null);
  const toggle = (key: string) => setExpanded(expanded === key ? null : key);

  // Topic filter
  const [topic, setTopic] = useState<string | null>(null);

  const formatDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const handlePlaceSearch = useCallback(async (query: string) => {
    const results = await searchPlace(query);
    setPlaceResults(results);
  }, []);

  const calculate = () => {
    if (!name.trim()) { Alert.alert('Error', 'Enter client name'); return; }
    let c = coords;
    if (!c && place) {
      const match = Object.entries(PLACE_COORDS).find(([city]) => place.toLowerCase().includes(city.toLowerCase()));
      if (match) c = match[1];
    }
    if (!c) { Alert.alert('Error', 'Select place from dropdown'); return; }

    setCalculating(true);
    setTimeout(() => {
      const combined = new Date(birthDate);
      combined.setHours(birthTime.getHours(), birthTime.getMinutes(), 0, 0);
      const kundli = computeKundli({
        name: name.trim(), date: birthDate, time: birthTime,
        place, lat: c!.lat, lon: c!.lon, utcOffset: 5.5,
      });
      setResult(kundli);
      setCalculating(false);
    }, 600);
  };

  const reset = () => { setResult(null); setTopic(null); setExpanded(null); };

  // ─── South Indian Chart ───────────────────────────────────────

  const renderSouthIndianChart = (planets: PlanetDetail[], lagnaIdx: number) => {
    const cell = Math.floor((SCREEN_W - 80) / 4);
    const grid: (number | null)[][] = [[0, 1, 2, 3], [11, null, null, 4], [10, null, null, 5], [9, 8, 7, 6]];

    const getPlanets = (signIdx: number) =>
      planets.filter((p) => p.rashiIndex === signIdx);

    return (
      <View style={s.chartContainer}>
        <View style={[s.siFrame, { width: cell * 4, height: cell * 4 }]}>
          {[1, 2, 3].map((i) => <View key={`h${i}`} style={[s.siLineH, { top: i * cell, width: cell * 4 }]} />)}
          {[1, 2, 3].map((i) => <View key={`v${i}`} style={[s.siLineV, { left: i * cell, height: cell * 4 }]} />)}
          <View style={[s.siDiag, { width: cell * 5.65, top: cell * 2, left: cell * 2 - cell * 2.82, transform: [{ rotate: '45deg' }] }]} />
          <View style={[s.siDiag, { width: cell * 5.65, top: cell * 2, left: cell * 2 - cell * 2.82, transform: [{ rotate: '-45deg' }] }]} />
          {grid.map((row, ry) => row.map((signIdx, cx) => {
            if (signIdx === null) return null;
            const houseNum = ((signIdx - lagnaIdx + 12) % 12) + 1;
            const planetsInSign = getPlanets(signIdx);
            const isLagna = signIdx === lagnaIdx;
            return (
              <View key={`${ry}-${cx}`} style={[s.siCell(cell), { left: cx * cell, top: ry * cell }, isLagna && s.siLagnaCell]}>
                <Text style={s.siSign}>{ZODIAC_SIGNS[signIdx]?.name?.slice(0, 3) ?? ''}</Text>
                <Text style={s.siHouse}>H{houseNum}</Text>
                {planetsInSign.map((p, i) => (
                  <Text key={i} style={[s.siPlanet, p.key === 'Sun' && { color: '#FFD700' }, p.key === 'Moon' && { color: '#C0C0C0' }, p.retrograde && s.retroText]}>
                    {SYM[p.key]}{p.retrograde ? '*' : ''}
                  </Text>
                ))}
              </View>
            );
          }))}
        </View>
      </View>
    );
  };

  // ─── Input Form ──────────────────────────────────────────────

  const renderInput = () => (
    <>
      <Text style={s.desc}>Client ஜாதகம் பகுப்பாய்வு — பிறந்த விவரங்களை உள்ளிடவும்</Text>

      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="person" size={16} color={ACCENT} />
          <Text style={s.cardHeaderText}>பிறந்த விவரங்கள்</Text>
        </View>

        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="Client Name" placeholderTextColor={TEXT_MID} value={name} onChangeText={setName} />
        </View>
        <View style={s.divider} />

        <View style={s.genderRow}>
          <TouchableOpacity style={[s.genderBtn, gender === 'male' && s.genderActive]} onPress={() => setGender('male')}>
            <Ionicons name="male" size={16} color={gender === 'male' ? BG : TEXT_MID} />
            <Text style={[s.genderTxt, gender === 'male' && s.genderTxtActive]}>ஆண் / Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.genderBtn, gender === 'female' && s.genderActive]} onPress={() => setGender('female')}>
            <Ionicons name="female" size={16} color={gender === 'female' ? BG : TEXT_MID} />
            <Text style={[s.genderTxt, gender === 'female' && s.genderTxtActive]}>பெண் / Female</Text>
          </TouchableOpacity>
        </View>
        <View style={s.divider} />

        <TouchableOpacity style={s.inputRow} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={16} color={ACCENT} />
          <Text style={s.inputLabel}>பிறந்த தேதி</Text>
          <Text style={s.inputValue}>{formatDate(birthDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && <DateTimePicker value={birthDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)} onChange={(_: DateTimePickerEvent, d?: Date) => { setShowDatePicker(Platform.OS === 'ios'); if (d) setBirthDate(d); }} />}
        <View style={s.divider} />

        <TouchableOpacity style={s.inputRow} onPress={() => setShowTimePicker(true)}>
          <Ionicons name="time" size={16} color={ACCENT} />
          <Text style={s.inputLabel}>பிறந்த நேரம்</Text>
          <Text style={s.inputValue}>{formatTime(birthTime)}</Text>
        </TouchableOpacity>
        {showTimePicker && <DateTimePicker value={birthTime} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} is24Hour onChange={(_: DateTimePickerEvent, d?: Date) => { setShowTimePicker(Platform.OS === 'ios'); if (d) setBirthTime(d); }} />}
        <View style={s.divider} />

        <View style={s.inputRow}>
          <Ionicons name="location" size={16} color={ACCENT} />
          <TextInput style={s.input} placeholder="பிறந்த இடம் / Birth Place" placeholderTextColor={TEXT_MID} value={place}
            onChangeText={(v) => { setPlace(v); setCoords(null); handlePlaceSearch(v); }} />
        </View>
        {placeResults.length > 0 && (
          <View style={s.placeDropdown}>
            {placeResults.map((p, i) => (
              <TouchableOpacity key={i} style={s.placeOption} onPress={() => { setPlace(p.name); setCoords({ lat: p.lat, lon: p.lon }); setPlaceResults([]); }}>
                <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {coords && <Text style={s.coordText}>Lat: {coords.lat.toFixed(4)}, Lon: {coords.lon.toFixed(4)}</Text>}
      </View>

      {/* Calculation Settings */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Ionicons name="settings" size={16} color={ACCENT} />
          <Text style={s.cardHeaderText}>கணக்கீட்டு அமைப்புகள்</Text>
        </View>
        <View style={s.settingRow}><Text style={s.settingLabel}>ஜோதிடம்</Text><Text style={s.settingValue}>Vedic / Sidereal</Text></View>
        <View style={s.settingRow}><Text style={s.settingLabel}>அயனாம்சம்</Text><Text style={s.settingValue}>Lahiri</Text></View>
        <View style={s.settingRow}><Text style={s.settingLabel}>சார்ட் வகை</Text><Text style={s.settingValue}>South Indian</Text></View>
        <View style={s.settingRow}><Text style={s.settingLabel}>Timezone</Text><Text style={s.settingValue}>IST (UTC+5:30)</Text></View>
      </View>

      <TouchableOpacity style={s.genBtn} onPress={calculate} disabled={calculating}>
        {calculating ? <ActivityIndicator color={ACCENT} /> : <Ionicons name="document-text" size={18} color="#FFFFFF" />}
        <Text style={s.genBtnTxt}>{calculating ? 'கணக்கிடுகிறது...' : 'ஜாதகம் உருவாக்கு'}</Text>
      </TouchableOpacity>
    </>
  );

  // ─── Results View ─────────────────────────────────────────────

  const renderResults = () => {
    if (!result) return null;
    const { lagna, planets, houses, navamsa, dasha, currentDasha, doshas } = result;
    const moon = planets.find((p) => p.key === 'Moon');
    const sun = planets.find((p) => p.key === 'Sun');

    return (
      <>
        {/* Birth Info */}
        <View style={s.card}>
          <Text style={s.infoName}>{result.input.name}</Text>
          <Text style={s.infoSub}>{formatDate(result.input.date)} · {formatTime(result.input.time)} · {result.input.place}</Text>
          <View style={s.infoChips}>
            <View style={s.chip}><Text style={s.chipLabel}>ராசி</Text><Text style={s.chipValue}>{moon?.rashiTa}</Text></View>
            <View style={s.chip}><Text style={s.chipLabel}>நட்சத்திரம்</Text><Text style={s.chipValue}>{moon?.nakshatraTa}</Text></View>
            <View style={s.chip}><Text style={s.chipLabel}>பாதம்</Text><Text style={s.chipValue}>{moon?.pada}</Text></View>
            <View style={s.chip}><Text style={s.chipLabel}>லக்னம்</Text><Text style={s.chipValue}>{ZODIAC_SIGNS[lagna.rashiIndex]?.name}</Text></View>
          </View>
        </View>

        {/* Topic Filter */}
        <View style={s.topicRow}>
          {['சார்ட்', 'கிரகங்கள்', 'பாவங்கள்', 'தசா', 'நவாம்சம்', 'தோஷம்'].map((t) => (
            <TouchableOpacity key={t} style={[s.topicBtn, topic === t && s.topicActive]} onPress={() => setTopic(topic === t ? null : t)}>
              <Text style={[s.topicTxt, topic === t && s.topicTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* D1 South Indian Chart */}
        {(!topic || topic === 'சார்ட்') && (
          <View style={s.card}>
            <Text style={s.cardHeaderText}>D1 ராசி சார்ட்</Text>
            {renderSouthIndianChart(planets, lagna.rashiIndex)}
          </View>
        )}

        {/* D9 Navamsa */}
        {(!topic || topic === 'நவாம்சம்') && (
          <View style={s.card}>
            <TouchableOpacity style={s.expandHeader} onPress={() => toggle('navamsa')}>
              <Text style={s.cardHeaderText}>D9 நவாம்சம்</Text>
              <Ionicons name={expanded === 'navamsa' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
            </TouchableOpacity>
            {expanded === 'navamsa' && (
              <>
                <View style={s.infoChips}>
                  <View style={s.chip}><Text style={s.chipLabel}>Lagna Navamsa</Text><Text style={s.chipValue}>{navamsa.lagna.navamsaSign}</Text></View>
                </View>
                <View style={[s.tableHeader, { marginTop: 10 }]}>
                  <Text style={[s.tableHead, { flex: 1 }]}>கிரகம்</Text>
                  <Text style={[s.tableHead, { flex: 1 }]}>ராசி</Text>
                  <Text style={[s.tableHead, { flex: 0.5, textAlign: 'center' }]}>பாகை</Text>
                </View>
                {PLANETS_ORDER.map((pKey) => {
                  const nav = navamsa.planets[pKey as keyof typeof navamsa.planets];
                  if (!nav) return null;
                  return (
                    <View key={pKey} style={s.tableRow}>
                      <Text style={[s.tableCell, { flex: 1 }]}>{SYM[pKey]} {PLANET_TA[pKey]}</Text>
                      <Text style={[s.tableCell, { flex: 1 }]}>{nav.navamsaSign}</Text>
                      <Text style={[s.tableCell, { flex: 0.5, textAlign: 'center' }]}>{nav.degreeInNavamsa.toFixed(1)}°</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {/* Planetary Positions */}
        {(!topic || topic === 'கிரகங்கள்') && (
          <View style={s.card}>
            <TouchableOpacity style={s.expandHeader} onPress={() => toggle('planets')}>
              <Text style={s.cardHeaderText}>கிரக நிலைகள்</Text>
              <Ionicons name={expanded === 'planets' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
            </TouchableOpacity>
            {expanded === 'planets' && (
              <>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHead, { flex: 0.8 }]}>கிரகம்</Text>
                  <Text style={[s.tableHead, { flex: 1 }]}>ராசி</Text>
                  <Text style={[s.tableHead, { flex: 0.8, textAlign: 'center' }]}>பாகை</Text>
                  <Text style={[s.tableHead, { flex: 0.5, textAlign: 'center' }]}>H</Text>
                  <Text style={[s.tableHead, { flex: 0.7 }]}>நிலை</Text>
                </View>
                {planets.map((p, i) => (
                  <View key={i} style={[s.tableRow, i % 2 === 0 && s.tableAlt]}>
                    <Text style={[s.tableCell, { flex: 0.8 }]}>{SYM[p.key]} {p.nameTa}</Text>
                    <Text style={[s.tableCell, { flex: 1 }]}>{p.rashiTa}</Text>
                    <Text style={[s.tableCell, { flex: 0.8, textAlign: 'center' }]}>{p.degreeStr}</Text>
                    <Text style={[s.tableCell, { flex: 0.5, textAlign: 'center' }]}>{p.house}</Text>
                    <View style={{ flex: 0.7 }}>
                      <Text style={[s.tableCell, { color: p.dignity === 'Debilitated' ? RED : p.dignity === 'Exalted' ? GREEN : TEXT_MID }]}>{p.dignityTa}</Text>
                      {p.retrograde && <Text style={s.retroBadge}>Rx</Text>}
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* Houses */}
        {(!topic || topic === 'பாவங்கள்') && (
          <View style={s.card}>
            <TouchableOpacity style={s.expandHeader} onPress={() => toggle('houses')}>
              <Text style={s.cardHeaderText}>பாவ விவரம் (12 பாவங்கள்)</Text>
              <Ionicons name={expanded === 'houses' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
            </TouchableOpacity>
            {expanded === 'houses' && houses.map((h) => (
              <View key={h.house} style={[s.houseRow, h.house === 1 && s.houseLagna]}>
                <View style={s.houseNum}><Text style={s.houseNumTxt}>{h.house}</Text></View>
                <View style={s.houseInfo}>
                  <Text style={s.houseName}>{h.nameTa} — {h.rashiTa}</Text>
                  <Text style={s.houseLord}>அதிபதி: {h.lordTa}</Text>
                  {h.planets.length > 0 && <Text style={s.housePlanets}>கிரகங்கள்: {h.planets.map((p) => SYM[p]).join(' ')}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Vimshottari Dasha */}
        {(!topic || topic === 'தசா') && (
          <View style={s.card}>
            <TouchableOpacity style={s.expandHeader} onPress={() => toggle('dasha')}>
              <Text style={s.cardHeaderText}>விம்சோத்தரி தசா</Text>
              <Ionicons name={expanded === 'dasha' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
            </TouchableOpacity>
            {expanded === 'dasha' && (
              <>
                <View style={s.dashaCurrentCard}>
                  <Text style={s.dashaCurrentLabel}>தற்போதைய மகாதசை</Text>
                  <Text style={s.dashaCurrentPlanet}>{SYM[currentDasha.maha.lord]} {PLANET_TA[currentDasha.maha.lord]}</Text>
                  <Text style={s.dashaCurrentDates}>{currentDasha.maha.startDate} — {currentDasha.maha.endDate}</Text>
                  <Text style={s.dashaCurrentLabel}>புத்தி (Antardasha)</Text>
                  <Text style={s.dashaCurrentPlanet}>{SYM[currentDasha.antar.lord]} {PLANET_TA[currentDasha.antar.lord]}</Text>
                  <Text style={s.dashaCurrentDates}>{currentDasha.antar.startDate} — {currentDasha.antar.endDate}</Text>
                </View>
                <Text style={s.dashaSubTitle}>மகாதசை காலவரிசை</Text>
                {dasha.mahadashas.map((m, i) => {
                  const now = Date.now();
                  const start = new Date(m.startDate).getTime();
                  const end = new Date(m.endDate).getTime();
                  const isCurrent = now >= start && now < end;
                  const isPast = now >= end;
                  const progress = isCurrent ? ((now - start) / (end - start)) * 100 : isPast ? 100 : 0;
                  const antars = i === 0 ? dasha.antardashas : [];
                  return (
                    <View key={i}>
                      <View style={[s.dashaRow, isCurrent && s.dashaRowActive]}>
                        <View style={s.dashaLeft}>
                          <Text style={s.dashaPlanet}>{SYM[m.lord]} {PLANET_TA[m.lord]}</Text>
                          <Text style={s.dashaDates}>{m.startDate} — {m.endDate}</Text>
                        </View>
                        {isCurrent ? (
                          <View style={s.dashaProgressWrap}>
                            <View style={s.dashaProgressBar}><View style={[s.dashaProgressFill, { width: `${progress}%` }]} /></View>
                            <Text style={s.dashaNow}>தற்போது</Text>
                          </View>
                        ) : isPast ? <Text style={s.dashaPast}>முடிந்தது</Text> : <Text style={s.dashaFuture}>வரவிருக்கிறது</Text>}
                      </View>
                      {isCurrent && antars.length > 0 && antars.map((a, j) => {
                        const aNow = Date.now();
                        const aStart = new Date(a.startDate).getTime();
                        const aEnd = new Date(a.endDate).getTime();
                        const aCurrent = aNow >= aStart && aNow < aEnd;
                        return (
                          <View key={j}>
                            <View style={[s.dashaSubRow, aCurrent && s.dashaSubActive]}>
                              <Text style={s.dashaSubPlanet}>{SYM[a.lord]} {PLANET_TA[a.lord]}</Text>
                              <Text style={s.dashaSubDates}>{a.startDate} — {a.endDate}</Text>
                            </View>
                            {aCurrent && result.pratyantardasha.length > 0 && result.pratyantardasha.map((p, k) => (
                              <View key={k} style={[s.dashaPratRow, p.isCurrent && s.dashaPratActive]}>
                                <Text style={s.dashaPratPlanet}>{p.symbol} {p.lordTa}</Text>
                                <Text style={s.dashaPratDates}>{p.startDate} — {p.endDate}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {/* Doshas */}
        {(!topic || topic === 'தோஷம்') && (
          <View style={s.card}>
            <TouchableOpacity style={s.expandHeader} onPress={() => toggle('doshas')}>
              <Text style={s.cardHeaderText}>தோஷ பகுப்பாய்வு</Text>
              <Ionicons name={expanded === 'doshas' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
            </TouchableOpacity>
            {expanded === 'doshas' && doshas.map((d, i) => {
              const sc = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED;
              return (
                <View key={i} style={s.doshaRow}>
                  <View style={[s.doshaDot, { backgroundColor: sc }]} />
                  <View style={s.doshaInfo}>
                    <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                    <Text style={s.doshaDetail}>{d.detail}</Text>
                  </View>
                  <Text style={[s.doshaStatus, { color: sc }]}>{d.status}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Current Transits */}
        <View style={s.card}>
          <TouchableOpacity style={s.expandHeader} onPress={() => toggle('transit')}>
            <Text style={s.cardHeaderText}>தற்போதைய பெயர்ச்சி</Text>
            <Ionicons name={expanded === 'transit' ? 'chevron-up' : 'chevron-down'} size={18} color={ACCENT} />
          </TouchableOpacity>
          {expanded === 'transit' && (
            <Text style={s.transitNote}>பெயர்ச்சி கணக்கீடு விரைவில் சேர்க்கப்படும்</Text>
          )}
        </View>

        {/* Reset */}
        <TouchableOpacity style={s.resetBtn} onPress={reset}>
          <Ionicons name="refresh" size={18} color={ACCENT} />
          <Text style={s.resetBtnTxt}>புதிய ஜாதகம் கணக்கிடு</Text>
        </TouchableOpacity>
      </>
    );
  };

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
            <Text style={s.headerTitle}>ஜாதக பகுப்பாய்வு</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Kundli Banner */}
          <View style={s.bannerWrap}>
            <ImageBackground
              source={require('../assets/astrologer-eranings.png')}
              style={s.banner}
              imageStyle={s.bannerImage}
              contentFit="cover"
            >
              <View style={s.bannerOverlay}>
                <Text style={s.bannerTitle}>Kundli Calculator</Text>
                <Text style={s.bannerSub}>Detailed birth chart analysis with Vedic astrology</Text>
              </View>
            </ImageBackground>
          </View>

          {result ? renderResults() : renderInput()}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  safeTop: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  desc: { fontSize: 13, color: TEXT_MID, lineHeight: 20, marginBottom: 16 },

  // Banner
  bannerWrap: { marginBottom: 16 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 120 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Cards
  card: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 14, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardHeaderText: { fontSize: 14, fontWeight: '700', color: ACCENT, letterSpacing: 0.5 },

  // Input
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  inputLabel: { fontSize: 13, color: TEXT_MID, flex: 1 },
  inputValue: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#E8E8E8' },

  // Gender
  genderRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: BORDER },
  genderActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  genderTxt: { fontSize: 12, fontWeight: '600', color: TEXT_MID },
  genderTxtActive: { color: '#FFFFFF' },

  // Place
  placeDropdown: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: BORDER, marginTop: 6, maxHeight: 140 },
  placeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: BORDER },
  placeOptionTxt: { fontSize: 11, color: TEXT_MID, flex: 1 },
  coordText: { fontSize: 10, color: ACCENT, marginTop: 6, opacity: 0.7 },

  // Settings
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  settingLabel: { fontSize: 12, color: TEXT_MID },
  settingValue: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },

  // Generate
  genBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, marginTop: 6, marginBottom: 20 },
  genBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Info
  infoName: { fontSize: 18, fontWeight: 'bold', color: TEXT_DARK },
  infoSub: { fontSize: 12, color: TEXT_MID, marginTop: 4 },
  infoChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: BORDER, minWidth: 70 },
  chipLabel: { fontSize: 10, color: TEXT_MID },
  chipValue: { fontSize: 12, fontWeight: '600', color: ACCENT, marginTop: 2 },

  // Topics
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  topicBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  topicActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  topicTxt: { fontSize: 11, fontWeight: '600', color: TEXT_MID },
  topicTxtActive: { color: '#FFFFFF' },

  // Chart
  chartContainer: { alignItems: 'center', marginTop: 8 },
  siFrame: { position: 'relative', overflow: 'hidden' },
  siLineH: { position: 'absolute', left: 0, height: 0.5, backgroundColor: CHART_BORDER },
  siLineV: { position: 'absolute', top: 0, width: 0.5, backgroundColor: CHART_BORDER },
  siDiag: { position: 'absolute', height: 0.8, backgroundColor: CHART_BORDER },
  siCell: (cell: number) => ({ width: cell, height: cell, alignItems: 'center', justifyContent: 'center', gap: 1 } as any),
  siSign: { fontSize: 8, fontWeight: '700', color: ACCENT, letterSpacing: 0.3 },
  siHouse: { fontSize: 7, color: TEXT_DIM },
  siPlanet: { fontSize: 10, color: '#FFFFFF' },
  siLagnaCell: { backgroundColor: 'rgba(176,156,102,0.2)' },
  retroText: { color: RED },

  // Tables
  expandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: CARD_LIGHT, borderRadius: 8, marginBottom: 2 },
  tableHead: { fontSize: 11, fontWeight: '700', color: TEXT_MID },
  tableRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  tableAlt: { backgroundColor: '#FAFAFA' },
  tableCell: { fontSize: 12, color: TEXT_DARK },

  // Houses
  houseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  houseLagna: { backgroundColor: ACCENT_DIM },
  houseNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT_DIM, alignItems: 'center', justifyContent: 'center' },
  houseNumTxt: { fontSize: 11, fontWeight: '700', color: ACCENT },
  houseInfo: { flex: 1 },
  houseName: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  houseLord: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
  housePlanets: { fontSize: 10, color: ACCENT, marginTop: 2 },

  // Dasha
  dashaCurrentCard: { backgroundColor: ACCENT_DIM, borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: ACCENT },
  dashaCurrentLabel: { fontSize: 10, fontWeight: '600', color: ACCENT, letterSpacing: 1 },
  dashaCurrentPlanet: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginTop: 4 },
  dashaCurrentDates: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
  dashaSubTitle: { fontSize: 12, fontWeight: '600', color: TEXT_MID, marginBottom: 8 },
  dashaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dashaRowActive: { backgroundColor: ACCENT_DIM },
  dashaLeft: { flex: 1 },
  dashaPlanet: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  dashaDates: { fontSize: 10, color: TEXT_MID, marginTop: 2 },
  dashaProgressWrap: { alignItems: 'flex-end', gap: 4 },
  dashaProgressBar: { width: 80, height: 4, backgroundColor: '#E8E8E8', borderRadius: 2, overflow: 'hidden' },
  dashaProgressFill: { height: 4, backgroundColor: ACCENT, borderRadius: 2 },
  dashaNow: { fontSize: 10, fontWeight: '700', color: ACCENT },
  dashaPast: { fontSize: 10, color: TEXT_DIM },
  dashaFuture: { fontSize: 10, color: TEXT_MID },
  dashaSubRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingLeft: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dashaSubActive: { backgroundColor: ACCENT_DIM },
  dashaSubPlanet: { fontSize: 11, color: TEXT_DARK },
  dashaSubDates: { fontSize: 9, color: TEXT_MID },
  dashaPratRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingLeft: 36, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dashaPratActive: { backgroundColor: 'rgba(176,156,102,0.12)' },
  dashaPratPlanet: { fontSize: 10, color: TEXT_MID },
  dashaPratDates: { fontSize: 8, color: TEXT_DIM },

  // Doshas
  doshaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  doshaDot: { width: 8, height: 8, borderRadius: 4 },
  doshaInfo: { flex: 1 },
  doshaName: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  doshaDetail: { fontSize: 10, color: TEXT_MID, marginTop: 2 },
  doshaStatus: { fontSize: 11, fontWeight: '700' },

  transitNote: { fontSize: 12, color: TEXT_MID, paddingVertical: 10 },

  // Reset
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: CARD, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: BORDER, marginTop: 8 },
  resetBtnTxt: { fontSize: 14, fontWeight: '600', color: ACCENT },
});
