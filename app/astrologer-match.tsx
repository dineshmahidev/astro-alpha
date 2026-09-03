import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { computePoruthamMatch, type MatchResult, type PersonData } from '@/lib/astrology/porutham-match';
import { PLACE_COORDS } from '@/constants/birth';

// ─── Theme (matching Astrologer Home) ──────────────────────────

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

// ─── Place Autocomplete ─────────────────────────────────────────

type PlaceResult = { name: string; lat: number; lon: number };

const searchPlace = async (query: string): Promise<PlaceResult[]> => {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    );
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
};

// ─── Component ──────────────────────────────────────────────────

export default function AstrologerMatchScreen() {
  const router = useRouter();

  // Bride state
  const [brideName, setBrideName] = useState('');
  const [brideDob, setBrideDob] = useState(new Date(1995, 0, 1));
  const [brideTob, setBrideTob] = useState(new Date(1995, 0, 1, 6, 0));
  const [bridePlace, setBridePlace] = useState('');
  const [brideCoords, setBrideCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showBrideDob, setShowBrideDob] = useState(false);
  const [showBrideTob, setShowBrideTob] = useState(false);
  const [bridePlaceResults, setBridePlaceResults] = useState<PlaceResult[]>([]);

  // Groom state
  const [groomName, setGroomName] = useState('');
  const [groomDob, setGroomDob] = useState(new Date(1993, 5, 15));
  const [groomTob, setGroomTob] = useState(new Date(1993, 5, 15, 6, 0));
  const [groomPlace, setGroomPlace] = useState('');
  const [groomCoords, setGroomCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showGroomDob, setShowGroomDob] = useState(false);
  const [showGroomTob, setShowGroomTob] = useState(false);
  const [groomPlaceResults, setGroomPlaceResults] = useState<PlaceResult[]>([]);

  // Result
  const [result, setResult] = useState<MatchResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Expandable sections
  const [expandedPorutham, setExpandedPorutham] = useState<string | null>(null);
  const [showPlanets, setShowPlanets] = useState(false);
  const [showHouses, setShowHouses] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const formatDate = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

  const handlePlaceSearch = useCallback(
    async (query: string, setResults: (r: PlaceResult[]) => void) => {
      const results = await searchPlace(query);
      setResults(results);
    },
    [],
  );

  const calculate = () => {
    if (!brideName || !groomName) {
      Alert.alert('Missing Info', 'Please enter both Bride and Groom names.');
      return;
    }
    // Auto-resolve known Indian cities if coords not set
    let bCoords = brideCoords;
    let gCoords = groomCoords;
    if (!bCoords && bridePlace) {
      const match = Object.entries(PLACE_COORDS).find(([city]) =>
        bridePlace.toLowerCase().includes(city.toLowerCase()),
      );
      if (match) bCoords = match[1];
    }
    if (!gCoords && groomPlace) {
      const match = Object.entries(PLACE_COORDS).find(([city]) =>
        groomPlace.toLowerCase().includes(city.toLowerCase()),
      );
      if (match) gCoords = match[1];
    }
    if (!bCoords || !gCoords) {
      Alert.alert('Place Required', 'Please select a place from the dropdown list for both Bride and Groom.');
      return;
    }
    setCalculating(true);
    setTimeout(() => {
      const bride: PersonData = {
        name: brideName, date: brideDob, time: brideTob,
        place: bridePlace, lat: bCoords!.lat, lon: bCoords!.lon,
      };
      const groom: PersonData = {
        name: groomName, date: groomDob, time: groomTob,
        place: groomPlace, lat: gCoords!.lat, lon: gCoords!.lon,
      };
      const matchResult = computePoruthamMatch(bride, groom);
      setResult(matchResult);
      setCalculating(false);
    }, 500);
  };

  const reset = () => {
    setBrideName(''); setBrideDob(new Date(1995, 0, 1)); setBrideTob(new Date(1995, 0, 1, 6, 0));
    setBridePlace(''); setBrideCoords(null);
    setGroomName(''); setGroomDob(new Date(1993, 5, 15)); setGroomTob(new Date(1993, 5, 15, 6, 0));
    setGroomPlace(''); setGroomCoords(null);
    setResult(null);
    setExpandedPorutham(null);
  };

  const scoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.8) return GREEN;
    if (pct >= 0.5) return ORANGE;
    return RED;
  };

  const resultIcon = (r: string) => {
    if (r === 'Good') return '✓';
    if (r === 'Average') return '⚠';
    return '✕';
  };

  const resultColor = (r: string) => (r === 'Good' ? GREEN : r === 'Average' ? ORANGE : RED);

  // ─── Input Form ─────────────────────────────────────────────

  const renderInputForm = () => (
    <>
      {/* Bride Card */}
      <View style={s.profileCard}>
        <View style={[s.profileHeader, { backgroundColor: 'rgba(233,30,99,0.15)' }]}>
          <Ionicons name="female" size={20} color="#E91E63" />
          <Text style={s.profileHeaderText}>BRIDE</Text>
        </View>
        <View style={s.profileBody}>
          <View style={s.inputRow}>
            <Ionicons name="person" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Name" placeholderTextColor={TEXT_MID} value={brideName} onChangeText={setBrideName} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowBrideDob(true)}>
            <Ionicons name="calendar" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatDate(brideDob)}</Text>
          </TouchableOpacity>
          {showBrideDob && (
            <DateTimePicker value={brideDob} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowBrideDob(Platform.OS === 'ios'); if (date) setBrideDob(date); }} />
          )}
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowBrideTob(true)}>
            <Ionicons name="time" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatTime(brideTob)}</Text>
          </TouchableOpacity>
          {showBrideTob && (
            <DateTimePicker value={brideTob} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowBrideTob(Platform.OS === 'ios'); if (date) setBrideTob(date); }} />
          )}
          <View style={s.divider} />
          <View style={s.inputRow}>
            <Ionicons name="location" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Place of Birth" placeholderTextColor={TEXT_MID} value={bridePlace}
              onChangeText={(v) => { setBridePlace(v); setBrideCoords(null); handlePlaceSearch(v, setBridePlaceResults); }} />
          </View>
          {bridePlaceResults.length > 0 && (
            <View style={s.placeDropdown}>
              {bridePlaceResults.map((p, i) => (
                <TouchableOpacity key={i} style={s.placeOption}
                  onPress={() => { setBridePlace(p.name); setBrideCoords({ lat: p.lat, lon: p.lon }); setBridePlaceResults([]); }}>
                  <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                  <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {brideCoords && <Text style={s.coordText}>Lat: {brideCoords.lat.toFixed(4)}, Lon: {brideCoords.lon.toFixed(4)}</Text>}
          {!brideCoords && bridePlace.length >= 3 && (
            <Text style={s.hintText}>Tap a result below to set coordinates</Text>
          )}
        </View>
      </View>

      {/* Groom Card */}
      <View style={s.profileCard}>
        <View style={[s.profileHeader, { backgroundColor: 'rgba(33,150,243,0.15)' }]}>
          <Ionicons name="male" size={20} color="#2196F3" />
          <Text style={s.profileHeaderText}>GROOM</Text>
        </View>
        <View style={s.profileBody}>
          <View style={s.inputRow}>
            <Ionicons name="person" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Name" placeholderTextColor={TEXT_MID} value={groomName} onChangeText={setGroomName} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowGroomDob(true)}>
            <Ionicons name="calendar" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatDate(groomDob)}</Text>
          </TouchableOpacity>
          {showGroomDob && (
            <DateTimePicker value={groomDob} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowGroomDob(Platform.OS === 'ios'); if (date) setGroomDob(date); }} />
          )}
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowGroomTob(true)}>
            <Ionicons name="time" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatTime(groomTob)}</Text>
          </TouchableOpacity>
          {showGroomTob && (
            <DateTimePicker value={groomTob} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowGroomTob(Platform.OS === 'ios'); if (date) setGroomTob(date); }} />
          )}
          <View style={s.divider} />
          <View style={s.inputRow}>
            <Ionicons name="location" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Place of Birth" placeholderTextColor={TEXT_MID} value={groomPlace}
              onChangeText={(v) => { setGroomPlace(v); setGroomCoords(null); handlePlaceSearch(v, setGroomPlaceResults); }} />
          </View>
          {groomPlaceResults.length > 0 && (
            <View style={s.placeDropdown}>
              {groomPlaceResults.map((p, i) => (
                <TouchableOpacity key={i} style={s.placeOption}
                  onPress={() => { setGroomPlace(p.name); setGroomCoords({ lat: p.lat, lon: p.lon }); setGroomPlaceResults([]); }}>
                  <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                  <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {groomCoords && <Text style={s.coordText}>Lat: {groomCoords.lat.toFixed(4)}, Lon: {groomCoords.lon.toFixed(4)}</Text>}
          {!groomCoords && groomPlace.length >= 3 && (
            <Text style={s.hintText}>Tap a result below to set coordinates</Text>
          )}
        </View>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity style={s.calcBtn} onPress={calculate} disabled={calculating}>
        {calculating ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="heart" size={20} color="#FFFFFF" />}
        <Text style={s.calcBtnTxt}>{calculating ? 'Calculating...' : 'Calculate Match'}</Text>
      </TouchableOpacity>
    </>
  );

  // ─── Results View ────────────────────────────────────────────

  const renderResults = () => {
    if (!result) return null;

    return (
      <>
        {/* Profile Summary Cards */}
        <View style={s.summaryRow}>
          {[result.bride, result.groom].map((person, idx) => (
            <View key={idx} style={[s.summaryCard, idx === 0 && { marginRight: 6 }]}>
              <View style={[s.summaryBadge, { backgroundColor: idx === 0 ? 'rgba(233,30,99,0.2)' : 'rgba(33,150,243,0.2)' }]}>
                <Ionicons name={idx === 0 ? 'female' : 'male'} size={16} color={idx === 0 ? '#E91E63' : '#2196F3'} />
                <Text style={[s.summaryBadgeTxt, { color: idx === 0 ? '#E91E63' : '#2196F3' }]}>
                  {idx === 0 ? 'BRIDE' : 'GROOM'}
                </Text>
              </View>
              <Text style={s.summaryName}>{person.name}</Text>
              <View style={s.summaryDetail}><Text style={s.summaryLabel}>Rasi</Text><Text style={s.summaryValue}>{person.rashi}</Text></View>
              <View style={s.summaryDetail}><Text style={s.summaryLabel}>Nakshatra</Text><Text style={s.summaryValue}>{person.nakshatra}</Text></View>
              <View style={s.summaryDetail}><Text style={s.summaryLabel}>Pada</Text><Text style={s.summaryValue}>{person.pada}</Text></View>
              <View style={s.summaryDetail}><Text style={s.summaryLabel}>Lagna</Text><Text style={s.summaryValue}>{person.lagna}</Text></View>
            </View>
          ))}
        </View>

        {/* Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreTitle}>பொருத்தம் / COMPATIBILITY</Text>
          <View style={s.scoreCircle}>
            <Text style={[s.scoreNumber, { color: scoreColor(result.totalScore, result.maxScore) }]}>
              {result.totalScore}
            </Text>
            <Text style={s.scoreMax}>/ {result.maxScore}</Text>
          </View>
          <Text style={[s.scoreVerdict, { color: scoreColor(result.totalScore, result.maxScore) }]}>
            {result.overallResult === 'Good Match' ? 'GOOD MATCH / நல்ல பொருத்தம்' :
             result.overallResult === 'Average Match' ? 'AVERAGE / சராசரி' :
             'NEEDS ATTENTION / கவனம் தேவை'}
          </Text>

          {result.strongAreas.length > 0 && (
            <View style={s.areaSection}>
              <Text style={s.areaLabel}>வலுவான பகுதிகள் / Strong Areas</Text>
              <View style={s.areaChips}>
                {result.strongAreas.map((a) => (
                  <View key={a} style={[s.areaChip, { backgroundColor: GREEN + '20' }]}>
                    <Text style={[s.areaChipTxt, { color: GREEN }]}>✓ {a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {result.attentionAreas.length > 0 && (
            <View style={s.areaSection}>
              <Text style={s.areaLabel}>கவனம் தேவை / Needs Attention</Text>
              <View style={s.areaChips}>
                {result.attentionAreas.map((a) => (
                  <View key={a} style={[s.areaChip, { backgroundColor: RED + '20' }]}>
                    <Text style={[s.areaChipTxt, { color: RED }]}>✕ {a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 10 Porutham Table */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>10 பொருத்தம் / 10 PORUTHAM RESULTS</Text>
          {result.poruthams.map((p) => (
            <View key={p.key}>
              <TouchableOpacity
                style={s.poruthamRow}
                onPress={() => setExpandedPorutham(expandedPorutham === p.key ? null : p.key)}
              >
                <View style={s.poruthamLeft}>
                  <Text style={[s.poruthamIcon, { color: resultColor(p.result) }]}>{resultIcon(p.result)}</Text>
                  <View>
                    <Text style={s.poruthamName}>{p.name}</Text>
                    <Text style={s.poruthamSub}>{p.brideValue} ↔ {p.groomValue}</Text>
                  </View>
                </View>
                <View style={s.poruthamRight}>
                  <Text style={[s.poruthamScore, { color: resultColor(p.result) }]}>
                    {p.score}/{p.maxScore}
                  </Text>
                  <Ionicons name={expandedPorutham === p.key ? 'chevron-up' : 'chevron-down'} size={16} color={TEXT_MID} />
                </View>
              </TouchableOpacity>
              {expandedPorutham === p.key && (
                <View style={s.poruthamExpanded}>
                  <Text style={s.poruthamReason}>{p.reason}</Text>
                  <View style={s.poruthamDetailRow}>
                    <Text style={s.poruthamDetailLabel}>Governs:</Text>
                    <Text style={s.poruthamDetailValue}>{p.governs}</Text>
                  </View>
                  {p.result !== 'Good' && (
                    <View style={s.poruthamDetailRow}>
                      <Text style={[s.poruthamDetailLabel, { color: RED }]}>If Fails:</Text>
                      <Text style={[s.poruthamDetailValue, { color: RED }]}>{p.effectIfFail}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Dosha Analysis */}
        <View style={s.sectionCard}>
          <Text style={s.sectionTitle}>தோஷ பகுப்பாய்வு / DOSHA ANALYSIS</Text>

          {/* Bride Doshas */}
          <View style={s.doshaSideHeader}>
            <Ionicons name="female" size={14} color="#E91E63" />
            <Text style={[s.doshaSideTxt, { color: '#E91E63' }]}>BRIDE / மணமகள்</Text>
          </View>
          {result.doshas.brideDoshas.map((d, i) => {
            const statusColor = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : d.status === 'Present' ? RED : RED;
            return (
              <View key={`b-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: statusColor }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: statusColor }]}>{d.status}</Text>
              </View>
            );
          })}

          {/* Groom Doshas */}
          <View style={[s.doshaSideHeader, { marginTop: 12 }]}>
            <Ionicons name="male" size={14} color="#2196F3" />
            <Text style={[s.doshaSideTxt, { color: '#2196F3' }]}>GROOM / மணமகன்</Text>
          </View>
          {result.doshas.groomDoshas.map((d, i) => {
            const statusColor = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : d.status === 'Present' ? RED : RED;
            return (
              <View key={`g-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: statusColor }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: statusColor }]}>{d.status}</Text>
              </View>
            );
          })}

          {/* Combined Doshas */}
          <View style={[s.doshaSideHeader, { marginTop: 12 }]}>
            <Ionicons name="heart" size={14} color={ACCENT} />
            <Text style={[s.doshaSideTxt, { color: ACCENT }]}>COMBINED / இணைப்பு தோஷம்</Text>
          </View>
          {result.doshas.combinedDoshas.map((d, i) => {
            const statusColor = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED;
            return (
              <View key={`c-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: statusColor }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: statusColor }]}>{d.status}</Text>
              </View>
            );
          })}
        </View>

        {/* Planetary Positions */}
        <View style={s.sectionCard}>
          <TouchableOpacity style={s.expandHeader} onPress={() => setShowPlanets(!showPlanets)}>
            <Text style={s.sectionTitle}>கிரக நிலைகள் / PLANETARY POSITIONS</Text>
            <Ionicons name={showPlanets ? 'chevron-up' : 'chevron-down'} size={20} color={ACCENT} />
          </TouchableOpacity>
          {showPlanets && (
            <>
              {[result.bride, result.groom].map((person, idx) => (
                <View key={idx}>
                  <Text style={s.chartLabel}>{idx === 0 ? 'BRIDE' : 'GROOM'}</Text>
                  {person.planetPositions.map((pp) => (
                    <View key={pp.planet} style={s.planetRow}>
                      <Text style={s.planetName}>{pp.planet}</Text>
                      <Text style={s.planetSign}>{pp.sign} {pp.degree}</Text>
                      {pp.retrograde && <Text style={s.retroBadge}>Rx</Text>}
                      {pp.combustion && <Text style={[s.retroBadge, { backgroundColor: ORANGE + '30', color: ORANGE }]}>Cb</Text>}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>

        {/* House Positions */}
        <View style={s.sectionCard}>
          <TouchableOpacity style={s.expandHeader} onPress={() => setShowHouses(!showHouses)}>
            <Text style={s.sectionTitle}>பாவ நிலைகள் / HOUSE POSITIONS</Text>
            <Ionicons name={showHouses ? 'chevron-up' : 'chevron-down'} size={20} color={ACCENT} />
          </TouchableOpacity>
          {showHouses && (
            <>
              {[result.bride, result.groom].map((person, idx) => (
                <View key={idx}>
                  <Text style={s.chartLabel}>{idx === 0 ? 'BRIDE' : 'GROOM'}</Text>
                  <View style={s.houseGrid}>
                    {person.housePositions.map((h) => (
                      <View key={h.house} style={[s.houseCell, h.house === 1 && s.houseLagna]}>
                        <Text style={s.houseNum}>{h.house}</Text>
                        <Text style={s.houseSign}>{h.sign}</Text>
                        {h.planets.length > 0 && (
                          <Text style={s.housePlanets}>{h.planets.join(', ')}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Birth Charts */}
        <View style={s.sectionCard}>
          <TouchableOpacity style={s.expandHeader} onPress={() => setShowCharts(!showCharts)}>
            <Text style={s.sectionTitle}>ஜாதகம் / BIRTH CHARTS</Text>
            <Ionicons name={showCharts ? 'chevron-up' : 'chevron-down'} size={20} color={ACCENT} />
          </TouchableOpacity>
          {showCharts && (
            <>
              {[result.bride, result.groom].map((person, idx) => (
                <View key={idx}>
                  <Text style={s.chartLabel}>{idx === 0 ? 'BRIDE' : 'GROOM'}</Text>
                  <View style={s.chartGrid}>
                    {person.housePositions.map((h) => (
                      <View key={h.house} style={[s.chartCell, h.house === 1 && s.chartLagna]}>
                        <Text style={s.chartHouseNum}>{h.house}</Text>
                        <Text style={s.chartCellSign}>{h.sign}</Text>
                        {h.planets.length > 0 && <Text style={s.chartCellPlanets}>{h.planets.join(' ')}</Text>}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Action Buttons */}
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={reset}>
            <Ionicons name="refresh" size={18} color={ACCENT} />
            <Text style={s.actionBtnTxt}>மீண்டும் கணக்கிடு / Recalculate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: ACCENT }]}>
            <Ionicons name="save" size={18} color="#FFFFFF" />
            <Text style={[s.actionBtnTxt, { color: '#FFFFFF' }]}>சேமி / Save Match</Text>
          </TouchableOpacity>
        </View>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn}>
            <Ionicons name="document-text" size={18} color={ACCENT} />
            <Text style={s.actionBtnTxt}>அறிக்கை / Generate Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn}>
            <Ionicons name="share" size={18} color={ACCENT} />
            <Text style={s.actionBtnTxt}>பகிர் / Share Report</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ─── Main Render ─────────────────────────────────────────────

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
            <Text style={s.headerTitle}>பொருத்தம் / Porutham Match</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Match Banner */}
          <View style={s.bannerWrap}>
            <ImageBackground
              source={require('../assets/match-banner.webp')}
              style={s.banner}
              imageStyle={s.bannerImage}
              contentFit="cover"
            >
              <View style={s.bannerOverlay}>
                <Text style={s.bannerTitle}>Porutham Match</Text>
                <Text style={s.bannerSub}>10 Porutham compatibility analysis</Text>
              </View>
            </ImageBackground>
          </View>

          {result ? renderResults() : renderInputForm()}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  scroll: { paddingHorizontal: 16 },

  // Banner
  bannerWrap: { marginBottom: 16 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 120 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Profile Input Cards
  profileCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 14, overflow: 'hidden' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  profileHeaderText: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, letterSpacing: 1 },
  profileBody: { padding: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  inputText: { flex: 1, fontSize: 14, color: TEXT_DARK },
  divider: { height: 1, backgroundColor: '#E8E8E8' },

  placeDropdown: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: BORDER, marginTop: 6, maxHeight: 140 },
  placeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: BORDER },
  placeOptionTxt: { fontSize: 11, color: TEXT_MID, flex: 1 },
  coordText: { fontSize: 10, color: ACCENT, marginTop: 6, opacity: 0.7 },
  hintText: { fontSize: 10, color: ORANGE, marginTop: 4, fontStyle: 'italic' },

  // Calculate
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, marginTop: 6, marginBottom: 20 },
  calcBtnTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Summary
  summaryRow: { flexDirection: 'row', marginBottom: 14 },
  summaryCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 14 },
  summaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 10 },
  summaryBadgeTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  summaryName: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 8 },
  summaryDetail: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryLabel: { fontSize: 11, color: TEXT_MID },
  summaryValue: { fontSize: 11, fontWeight: '600', color: TEXT_DARK },

  // Score Card
  scoreCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, alignItems: 'center', marginBottom: 14 },
  scoreTitle: { fontSize: 12, fontWeight: '700', color: TEXT_MID, letterSpacing: 2, marginBottom: 12 },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  scoreNumber: { fontSize: 48, fontWeight: '800' },
  scoreMax: { fontSize: 18, color: TEXT_MID, marginLeft: 4 },
  scoreVerdict: { fontSize: 14, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  areaSection: { width: '100%', marginTop: 10 },
  areaLabel: { fontSize: 11, fontWeight: '600', color: TEXT_MID, marginBottom: 6 },
  areaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  areaChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  areaChipTxt: { fontSize: 11, fontWeight: '600' },

  // Porutham Table
  sectionCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginBottom: 14, overflow: 'hidden' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: ACCENT, letterSpacing: 1, padding: 16, paddingBottom: 8 },
  poruthamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: BORDER },
  poruthamLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  poruthamIcon: { fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center' },
  poruthamName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  poruthamSub: { fontSize: 10, color: TEXT_MID, marginTop: 2 },
  poruthamRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  poruthamScore: { fontSize: 13, fontWeight: '700' },
  poruthamExpanded: { paddingHorizontal: 16, paddingBottom: 14, backgroundColor: CARD_LIGHT },
  poruthamReason: { fontSize: 12, color: TEXT_MID, marginBottom: 8, lineHeight: 18 },
  poruthamDetailRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  poruthamDetailLabel: { fontSize: 11, fontWeight: '600', color: ACCENT },
  poruthamDetailValue: { fontSize: 11, color: TEXT_DARK, flex: 1 },

  // Dosha
  doshaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: BORDER, gap: 10 },
  doshaDot: { width: 8, height: 8, borderRadius: 4 },
  doshaInfo: { flex: 1 },
  doshaName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  doshaDetail: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
  doshaStatus: { fontSize: 12, fontWeight: '700' },
  doshaSideHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  doshaSideTxt: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Planets
  expandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0.3, borderColor: BORDER, gap: 10 },
  planetName: { width: 70, fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  planetSign: { flex: 1, fontSize: 12, color: TEXT_MID },
  retroBadge: { fontSize: 9, fontWeight: '700', color: RED, backgroundColor: RED + '20', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  chartLabel: { fontSize: 12, fontWeight: '700', color: ACCENT, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },

  // Houses
  houseGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 10 },
  houseCell: { width: '22%', margin: '1.5%', backgroundColor: CARD_LIGHT, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  houseLagna: { borderColor: ACCENT, backgroundColor: ACCENT_DIM },
  houseNum: { fontSize: 10, color: TEXT_MID },
  houseSign: { fontSize: 11, fontWeight: '600', color: TEXT_DARK, marginTop: 2 },
  housePlanets: { fontSize: 9, color: ACCENT, marginTop: 2 },

  // Charts
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, paddingBottom: 10 },
  chartCell: { width: '30%', margin: '1.66%', backgroundColor: CARD_LIGHT, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: BORDER, alignItems: 'center', minHeight: 60 },
  chartLagna: { borderColor: ACCENT, borderWidth: 2, backgroundColor: ACCENT_DIM },
  chartHouseNum: { fontSize: 9, color: TEXT_MID },
  chartCellSign: { fontSize: 10, fontWeight: '600', color: TEXT_DARK, marginTop: 2 },
  chartCellPlanets: { fontSize: 8, color: ACCENT, marginTop: 2, textAlign: 'center' },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: CARD, borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: BORDER },
  actionBtnTxt: { fontSize: 13, fontWeight: '600', color: ACCENT },
});
