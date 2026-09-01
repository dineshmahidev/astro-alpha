import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ImageBackground } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet, TouchableOpacity, View, Text, TextInput,
  Modal, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/auth-context';
import { computePoruthamMatch, type MatchResult, type PersonData } from '@/lib/astrology/porutham-match';
import { PLACE_COORDS } from '@/constants/birth';

// ─── Theme ──────────────────────────────────────────────────

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

// ─── Place Autocomplete ─────────────────────────────────────

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
  } catch { return []; }
};

// ─── Component ──────────────────────────────────────────────

export default function ConsumerMatchScreen() {
  const router = useRouter();
  const { user, birthDetails, language: lang } = useAuth();
  const [showPopup, setShowPopup] = useState(true);

  // ─── Form State (You = auto-filled from profile) ──────────
  const [youName, setYouName] = useState('');
  const [youDob, setYouDob] = useState(new Date(1995, 0, 1));
  const [youTob, setYouTob] = useState(new Date(1995, 0, 1, 6, 0));
  const [youPlace, setYouPlace] = useState('');
  const [youCoords, setYouCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [youPlaceResults, setYouPlaceResults] = useState<PlaceResult[]>([]);
  const [showYouDob, setShowYouDob] = useState(false);
  const [showYouTob, setShowYouTob] = useState(false);

  // ─── Form State (Partner) ─────────────────────────────────
  const [partnerName, setPartnerName] = useState('');
  const [partnerDob, setPartnerDob] = useState(new Date(1995, 0, 1));
  const [partnerTob, setPartnerTob] = useState(new Date(1995, 0, 1, 6, 0));
  const [partnerPlace, setPartnerPlace] = useState('');
  const [partnerCoords, setPartnerCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [partnerPlaceResults, setPartnerPlaceResults] = useState<PlaceResult[]>([]);
  const [showPartnerDob, setShowPartnerDob] = useState(false);
  const [showPartnerTob, setShowPartnerTob] = useState(false);

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [expandedPorutham, setExpandedPorutham] = useState<string | null>(null);

  // Auto-fill from login user profile
  useEffect(() => {
    if (birthDetails) {
      if (birthDetails.name) setYouName(birthDetails.name);
      if (birthDetails.dobDate) setYouDob(birthDetails.dobDate instanceof Date ? birthDetails.dobDate : new Date(birthDetails.dobDate));
      if (birthDetails.tobDate) setYouTob(birthDetails.tobDate instanceof Date ? birthDetails.tobDate : new Date(birthDetails.tobDate));
      if (birthDetails.place) setYouPlace(birthDetails.place);
    } else if (user?.name) {
      setYouName(user.name);
    }
  }, [birthDetails, user]);

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  // ─── Place Search ─────────────────────────────────────────

  const handlePlaceSearch = async (query: string, setResults: (r: PlaceResult[]) => void) => {
    if (query.length < 3) { setResults([]); return; }
    const results = await searchPlace(query);
    setResults(results);
  };

  const selectPlace = (place: PlaceResult, setPlace: (v: string) => void, setCoords: (c: { lat: number; lon: number } | null) => void, setResults: (r: PlaceResult[]) => void) => {
    setPlace(place.name);
    setCoords({ lat: place.lat, lon: place.lon });
    setResults([]);
  };

  // ─── Calculate ────────────────────────────────────────────

  const calculate = () => {
    if (!youName || !partnerName) {
      Alert.alert('Missing Info', 'Please enter both names.');
      return;
    }

    // Auto-resolve known Indian cities if coords not set
    let yCoords = youCoords;
    let pCoords = partnerCoords;
    if (!yCoords && youPlace) {
      const match = Object.entries(PLACE_COORDS).find(([city]) =>
        youPlace.toLowerCase().includes(city.toLowerCase()),
      );
      if (match) yCoords = match[1];
    }
    if (!pCoords && partnerPlace) {
      const match = Object.entries(PLACE_COORDS).find(([city]) =>
        partnerPlace.toLowerCase().includes(city.toLowerCase()),
      );
      if (match) pCoords = match[1];
    }
    if (!yCoords || !pCoords) {
      Alert.alert('Place Required', 'Please select a place from the dropdown for both.');
      return;
    }

    setCalculating(true);
    setTimeout(() => {
      const you: PersonData = {
        name: youName, date: youDob, time: youTob,
        place: youPlace, lat: yCoords!.lat, lon: yCoords!.lon,
      };
      const partner: PersonData = {
        name: partnerName, date: partnerDob, time: partnerTob,
        place: partnerPlace, lat: pCoords!.lat, lon: pCoords!.lon,
      };
      const matchResult = computePoruthamMatch(you, partner);
      setResult(matchResult);
      setCalculating(false);
    }, 500);
  };

  const reset = () => {
    setResult(null);
    setExpandedPorutham(null);
    setPartnerName('');
    setPartnerDob(new Date(1995, 0, 1));
    setPartnerTob(new Date(1995, 0, 1, 6, 0));
    setPartnerPlace('');
    setPartnerCoords(null);
  };

  const scoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.8) return GREEN;
    if (pct >= 0.5) return ORANGE;
    return RED;
  };

  const resultIcon = (r: string) => r === 'Good' ? '✓' : r === 'Average' ? '⚠' : '✕';
  const resultColor = (r: string) => r === 'Good' ? GREEN : r === 'Average' ? ORANGE : RED;

  // ─── Popup Modal ────────────────────────────────────────────

  const renderPopup = () => (
    <Modal visible={showPopup} transparent animationType="slide" onRequestClose={() => setShowPopup(false)}>
      <View style={s.popupOverlay}>
        <View style={s.popupContainer}>
          <TouchableOpacity style={s.popupClose} onPress={() => setShowPopup(false)}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <ImageBackground
            source={require('../assets/match-banner.png')}
            style={s.popupBanner}
            imageStyle={s.popupBannerImage}
            contentFit="cover"
          >
            <View style={s.popupBannerOverlay}>
              <Text style={s.popupTitle}>நான் எப்போது திருமணம் செய்வேன்?</Text>
              <Text style={s.popupSub}>Personalized prediction based on your birth chart</Text>
              <TouchableOpacity style={s.popupBtn} onPress={() => setShowPopup(false)}>
                <Text style={s.popupBtnText}>Start Matching</Text>
                <Ionicons name="arrow-forward" size={16} color={ACCENT} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );

  // ─── Input Form ────────────────────────────────────────────

  const renderInputForm = () => (
    <>
      {/* Marriage Timing Button */}
      <TouchableOpacity style={s.bigBtn} onPress={() => router.push('/match-result')} disabled={!birthDetails?.dob}>
        <View style={s.bigBtnIcon}>
          <Ionicons name="heart" size={24} color="#FFFFFF" />
        </View>
        <View style={s.bigBtnInfo}>
          <Text style={s.bigBtnTitle}>Check Marriage Timing</Text>
          <Text style={s.bigBtnSub}>3 வருட திருமண கணிப்பு / 3 Year Prediction</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Divider */}
      <View style={s.sectionDivider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>OR</Text>
        <View style={s.dividerLine} />
      </View>

      {/* You Card (auto-filled) */}
      <View style={s.profileCard}>
        <View style={[s.profileHeader, { backgroundColor: ACCENT_DIM }]}>
          <Ionicons name="person" size={20} color={ACCENT} />
          <Text style={s.profileHeaderText}>YOU</Text>
        </View>
        <View style={s.profileBody}>
          <View style={s.inputRow}>
            <Ionicons name="person" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Your Name" placeholderTextColor={TEXT_DIM} value={youName} onChangeText={setYouName} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowYouDob(true)}>
            <Ionicons name="calendar" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatDate(youDob)}</Text>
          </TouchableOpacity>
          {showYouDob && (
            <DateTimePicker value={youDob} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowYouDob(Platform.OS === 'ios'); if (date) setYouDob(date); }} />
          )}
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowYouTob(true)}>
            <Ionicons name="time" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatTime(youTob)}</Text>
          </TouchableOpacity>
          {showYouTob && (
            <DateTimePicker value={youTob} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowYouTob(Platform.OS === 'ios'); if (date) setYouTob(date); }} />
          )}
          <View style={s.divider} />
          <View style={s.inputRow}>
            <Ionicons name="location" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Place of Birth" placeholderTextColor={TEXT_DIM} value={youPlace}
              onChangeText={(v) => { setYouPlace(v); setYouCoords(null); handlePlaceSearch(v, setYouPlaceResults); }} />
          </View>
          {youPlaceResults.length > 0 && (
            <View style={s.placeDropdown}>
              {youPlaceResults.map((p, i) => (
                <TouchableOpacity key={i} style={s.placeOption}
                  onPress={() => selectPlace(p, setYouPlace, setYouCoords, setYouPlaceResults)}>
                  <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                  <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {youCoords && <Text style={s.coordText}>Lat: {youCoords.lat.toFixed(4)}, Lon: {youCoords.lon.toFixed(4)}</Text>}
        </View>
      </View>

      {/* Partner Card */}
      <View style={s.profileCard}>
        <View style={[s.profileHeader, { backgroundColor: 'rgba(233,30,99,0.12)' }]}>
          <Ionicons name="heart" size={20} color="#E91E63" />
          <Text style={s.profileHeaderText}>PARTNER</Text>
        </View>
        <View style={s.profileBody}>
          <View style={s.inputRow}>
            <Ionicons name="person" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Partner Name" placeholderTextColor={TEXT_DIM} value={partnerName} onChangeText={setPartnerName} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowPartnerDob(true)}>
            <Ionicons name="calendar" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatDate(partnerDob)}</Text>
          </TouchableOpacity>
          {showPartnerDob && (
            <DateTimePicker value={partnerDob} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)}
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowPartnerDob(Platform.OS === 'ios'); if (date) setPartnerDob(date); }} />
          )}
          <View style={s.divider} />
          <TouchableOpacity style={s.inputRow} onPress={() => setShowPartnerTob(true)}>
            <Ionicons name="time" size={16} color={ACCENT} />
            <Text style={s.inputText}>{formatTime(partnerTob)}</Text>
          </TouchableOpacity>
          {showPartnerTob && (
            <DateTimePicker value={partnerTob} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={(_: DateTimePickerEvent, date?: Date) => { setShowPartnerTob(Platform.OS === 'ios'); if (date) setPartnerTob(date); }} />
          )}
          <View style={s.divider} />
          <View style={s.inputRow}>
            <Ionicons name="location" size={16} color={ACCENT} />
            <TextInput style={s.input} placeholder="Place of Birth" placeholderTextColor={TEXT_DIM} value={partnerPlace}
              onChangeText={(v) => { setPartnerPlace(v); setPartnerCoords(null); handlePlaceSearch(v, setPartnerPlaceResults); }} />
          </View>
          {partnerPlaceResults.length > 0 && (
            <View style={s.placeDropdown}>
              {partnerPlaceResults.map((p, i) => (
                <TouchableOpacity key={i} style={s.placeOption}
                  onPress={() => selectPlace(p, setPartnerPlace, setPartnerCoords, setPartnerPlaceResults)}>
                  <Ionicons name="location-outline" size={12} color={TEXT_MID} />
                  <Text style={s.placeOptionTxt} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {partnerCoords && <Text style={s.coordText}>Lat: {partnerCoords.lat.toFixed(4)}, Lon: {partnerCoords.lon.toFixed(4)}</Text>}
        </View>
      </View>

      {/* Calculate Button */}
      <TouchableOpacity style={s.calcBtn} onPress={calculate} disabled={calculating}>
        {calculating ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="heart" size={20} color="#FFFFFF" />}
        <Text style={s.calcBtnTxt}>{calculating ? 'Calculating...' : 'Calculate Match'}</Text>
      </TouchableOpacity>
    </>
  );

  // ─── Results View ──────────────────────────────────────────

  const renderResults = () => {
    if (!result) return null;
    return (
      <>
        {/* Score Card */}
        <View style={s.scoreCard}>
          <Text style={s.coupleNames}>{result.bride.name} & {result.groom.name}</Text>
          <View style={[s.scoreCircle, { borderColor: scoreColor(result.totalScore, result.maxScore) }]}>
            <Text style={[s.scoreNum, { color: scoreColor(result.totalScore, result.maxScore) }]}>{result.totalScore}</Text>
            <Text style={s.scoreMax}>/ {result.maxScore}</Text>
          </View>
          <Text style={[s.scoreVerdict, { color: scoreColor(result.totalScore, result.maxScore) }]}>
            {result.overallResult === 'Good Match' ? 'GOOD MATCH / நல்ல பொருத்தம்' :
             result.overallResult === 'Average Match' ? 'AVERAGE / சராசரி' :
             'NEEDS ATTENTION / கவனம் தேவை'}
          </Text>
          {/* Result Explanation */}
          <View style={s.explainBox}>
            {result.overallResult === 'Good Match' ? (
              <>
                <Text style={s.explainMain}>✓ நல்ல பொருத்தம்</Text>
                <Text style={s.explainTa}>இருவருக்கும் நல்ல இணக்கம். கல்யாணம் செய்துகொள்ளலாம்.</Text>
                <Text style={s.explainEn}>Good compatibility. You can proceed with marriage.</Text>
              </>
            ) : result.overallResult === 'Average Match' ? (
              <>
                <Text style={s.explainMain}>⚠ சராசரி பொருத்தம்</Text>
                <Text style={s.explainTa}>சில பொருத்தங்கள் குறைவு. ஜோதிடரை கலந்தாலோசியுங்கள்.</Text>
                <Text style={s.explainEn}>Some compatibility gaps. Consult an astrologer before proceeding.</Text>
              </>
            ) : (
              <>
                <Text style={s.explainMain}>✕ கவனம் தேவை</Text>
                <Text style={s.explainTa}>பொருத்தம் குறைவு. கட்டாயம் ஜோதிடரை கலந்தாலோசியுங்கள்.</Text>
                <Text style={s.explainEn}>Low compatibility. Strongly consult an astrologer.</Text>
              </>
            )}
          </View>
        </View>

        {/* 10 Porutham */}
        <Text style={s.sectionTitle}>10 Porutham Results</Text>
        {result.poruthams.map((p) => (
          <View key={p.key}>
            <TouchableOpacity style={s.poruthamRow} onPress={() => setExpandedPorutham(expandedPorutham === p.key ? null : p.key)}>
              <View style={s.poruthamLeft}>
                <Text style={[s.poruthamIcon, { color: resultColor(p.result) }]}>{resultIcon(p.result)}</Text>
                <View>
                  <Text style={s.poruthamName}>{p.nameTa} / {p.name}</Text>
                  <Text style={s.poruthamSub}>{p.brideValue} ↔ {p.groomValue}</Text>
                </View>
              </View>
              <View style={s.poruthamRight}>
                <Text style={[s.poruthamScore, { color: resultColor(p.result) }]}>{p.score}/{p.maxScore}</Text>
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

        {/* Doshas */}
        <View style={s.doshaCard}>
          <Text style={s.doshaTitle}>Dosha Analysis / தோஷ பகுப்பாய்வு</Text>

          {/* Bride Doshas */}
          {result.doshas.brideDoshas.length > 0 && (
            <Text style={s.doshaSectionLabel}>{result.bride.name}</Text>
          )}
          {result.doshas.brideDoshas.map((d, i) => {
            const sc = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED;
            const statusTa = d.status === 'Clear' ? 'தோஷம் இல்லை' : d.status === 'Mild' ? 'சிறிய தோஷம்' : 'கவனம் தேவை';
            return (
              <View key={`b-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: sc }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                  <Text style={[s.doshaMeaningTa, { color: sc }]}>→ {statusTa}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: sc }]}>{d.status}</Text>
              </View>
            );
          })}

          {/* Groom Doshas */}
          {result.doshas.groomDoshas.length > 0 && (
            <Text style={s.doshaSectionLabel}>{result.groom.name}</Text>
          )}
          {result.doshas.groomDoshas.map((d, i) => {
            const sc = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED;
            const statusTa = d.status === 'Clear' ? 'தோஷம் இல்லை' : d.status === 'Mild' ? 'சிறிய தோஷம்' : 'கவனம் தேவை';
            return (
              <View key={`g-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: sc }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                  <Text style={[s.doshaMeaningTa, { color: sc }]}>→ {statusTa}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: sc }]}>{d.status}</Text>
              </View>
            );
          })}

          {/* Combined Doshas */}
          {result.doshas.combinedDoshas.length > 0 && (
            <Text style={s.doshaSectionLabel}>Combined / இருவருக்கும்</Text>
          )}
          {result.doshas.combinedDoshas.map((d, i) => {
            const sc = d.status === 'Clear' ? GREEN : d.status === 'Mild' ? ORANGE : RED;
            const statusTa = d.status === 'Clear' ? 'தோஷம் இல்லை' : d.status === 'Mild' ? 'சிறிய தோஷம்' : 'கவனம் தேவை';
            return (
              <View key={`c-${i}`} style={s.doshaRow}>
                <View style={[s.doshaDot, { backgroundColor: sc }]} />
                <View style={s.doshaInfo}>
                  <Text style={s.doshaName}>{d.nameTa} / {d.name}</Text>
                  <Text style={s.doshaDetail}>{d.detail}</Text>
                  <Text style={[s.doshaMeaningTa, { color: sc }]}>→ {statusTa}</Text>
                </View>
                <Text style={[s.doshaStatus, { color: sc }]}>{d.status}</Text>
              </View>
            );
          })}
        </View>

        {/* What To Do Box */}
        <View style={s.instructionCard}>
          <Text style={s.instructionTitle}>என்ன செய்யலாம்? / What to Do?</Text>

          <View style={s.instructionItem}>
            <Text style={s.instructionIcon}>1</Text>
            <View style={s.instructionContent}>
              <Text style={s.instructionHead}>பொருத்தம் நல்லதாக இருந்தால்</Text>
              <Text style={s.instructionBody}>கல்யாணத்தை திட்டமிடலாம். ஜோதிடரிடம் முறைப்படி சாஸ்திரம் பாருங்கள்.</Text>
            </View>
          </View>

          <View style={s.instructionItem}>
            <Text style={s.instructionIcon}>2</Text>
            <View style={s.instructionContent}>
              <Text style={s.instructionHead}>சராசரியாக இருந்தால்</Text>
              <Text style={s.instructionBody}>பரிகாரம் செய்து திருமணம் செய்யலாம். ஜோதிடரை கலந்தாலோசியுங்கள்.</Text>
            </View>
          </View>

          <View style={s.instructionItem}>
            <Text style={s.instructionIcon}>3</Text>
            <View style={s.instructionContent}>
              <Text style={s.instructionHead}>தோஷம் இருந்தால்</Text>
              <Text style={s.instructionBody}>பரிகாரம் அவசியம். ஜோதிடரை கலந்தாலோசித்து திருமணம் செய்யுங்கள்.</Text>
            </View>
          </View>

          <View style={s.instructionItem}>
            <Text style={s.instructionIcon}>4</Text>
            <View style={s.instructionContent}>
              <Text style={s.instructionHead}>திருமண காலம் தெரிய</Text>
              <Text style={s.instructionBody}>Check Marriage Timing பொருத்தம் பாருங்கள். 3 வருட கணிப்பு கிடைக்கும்.</Text>
            </View>
          </View>
        </View>

        {/* Recalculate */}
        <TouchableOpacity style={s.resetBtn} onPress={reset}>
          <Ionicons name="refresh" size={18} color={ACCENT} />
          <Text style={s.resetBtnTxt}>Recalculate</Text>
        </TouchableOpacity>
      </>
    );
  };

  // ─── Main Render ────────────────────────────────────────────

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      {renderPopup()}
      <SafeAreaView style={s.safeTop} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Match Making</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Banner */}
          <View style={s.bannerWrap}>
            <ImageBackground
              source={require('../assets/match-banner.png')}
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

// ─── Styles ─────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  safeTop: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },

  // Banner
  bannerWrap: { marginBottom: 16 },
  banner: { borderRadius: 14, overflow: 'hidden', minHeight: 120 },
  bannerImage: { borderRadius: 14 },
  bannerOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: ACCENT, marginTop: 4 },

  // Popup
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  popupContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '65%' },
  popupClose: { position: 'absolute', top: 12, right: 12, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  popupBanner: { width: '100%', minHeight: 280 },
  popupBannerImage: { borderRadius: 0 },
  popupBannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  popupTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  popupSub: { fontSize: 13, color: ACCENT, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  popupBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14, marginTop: 24 },
  popupBtnText: { fontSize: 15, fontWeight: '700', color: ACCENT },

  // Big Button
  bigBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: ACCENT, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 18, marginBottom: 14 },
  bigBtnIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  bigBtnInfo: { flex: 1 },
  bigBtnTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  bigBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Divider
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8E8E8' },
  dividerText: { fontSize: 12, fontWeight: '600', color: TEXT_DIM },

  // Profile Cards
  profileCard: { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 14, overflow: 'hidden' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  profileHeaderText: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, letterSpacing: 1 },
  profileBody: { padding: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  inputText: { flex: 1, fontSize: 13, fontWeight: '500', color: TEXT_DARK, textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#E8E8E8' },

  // Place
  placeDropdown: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: BORDER, marginTop: 6, maxHeight: 140 },
  placeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderColor: BORDER },
  placeOptionTxt: { fontSize: 11, color: TEXT_MID, flex: 1 },
  coordText: { fontSize: 10, color: ACCENT, marginTop: 6, opacity: 0.7 },

  // Calculate
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16, marginTop: 6, marginBottom: 20 },
  calcBtnTxt: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Score Card
  scoreCard: { alignItems: 'center', backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 20, marginBottom: 14 },
  coupleNames: { fontSize: 16, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 12 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 36, fontWeight: 'bold' },
  scoreMax: { fontSize: 14, color: TEXT_MID, marginLeft: 4 },
  scoreVerdict: { fontSize: 14, fontWeight: '700', marginTop: 8 },

  // Porutham
  sectionTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK, marginBottom: 10 },
  poruthamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6, borderWidth: 1, borderColor: BORDER },
  poruthamLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  poruthamIcon: { fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center' },
  poruthamName: { fontSize: 13, fontWeight: '600', color: TEXT_DARK },
  poruthamSub: { fontSize: 10, color: TEXT_MID, marginTop: 2 },
  poruthamRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  poruthamScore: { fontSize: 13, fontWeight: '700' },
  poruthamExpanded: { backgroundColor: CARD_LIGHT, borderRadius: 12, paddingHorizontal: 14, paddingBottom: 14, marginBottom: 6, borderWidth: 1, borderColor: BORDER },
  poruthamReason: { fontSize: 12, color: TEXT_MID, marginBottom: 8, lineHeight: 18 },
  poruthamDetailRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  poruthamDetailLabel: { fontSize: 11, fontWeight: '600', color: ACCENT },
  poruthamDetailValue: { fontSize: 11, color: TEXT_DARK, flex: 1 },

  // Doshas
  doshaCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 14 },
  doshaTitle: { fontSize: 14, fontWeight: '700', color: ACCENT, marginBottom: 12 },
  doshaSectionLabel: { fontSize: 12, fontWeight: '700', color: TEXT_DARK, marginTop: 8, marginBottom: 4, paddingLeft: 4 },
  doshaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  doshaDot: { width: 8, height: 8, borderRadius: 4 },
  doshaInfo: { flex: 1 },
  doshaName: { fontSize: 12, fontWeight: '600', color: TEXT_DARK },
  doshaDetail: { fontSize: 10, color: TEXT_MID, marginTop: 2, lineHeight: 14 },
  doshaMeaningTa: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  doshaStatus: { fontSize: 11, fontWeight: '700' },

  // Explanation Box
  explainBox: { backgroundColor: CARD_LIGHT, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: BORDER },
  explainMain: { fontSize: 15, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
  explainTa: { fontSize: 12, color: TEXT_MID, lineHeight: 18, marginBottom: 4 },
  explainEn: { fontSize: 11, color: TEXT_DIM, lineHeight: 16 },

  // Instruction Card
  instructionCard: { backgroundColor: '#FFF9E8', borderRadius: 16, borderWidth: 1, borderColor: ACCENT, padding: 16, marginBottom: 14 },
  instructionTitle: { fontSize: 15, fontWeight: '700', color: ACCENT, marginBottom: 14 },
  instructionItem: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  instructionIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENT, color: '#FFFFFF', fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 24, overflow: 'hidden' },
  instructionContent: { flex: 1 },
  instructionHead: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginBottom: 2 },
  instructionBody: { fontSize: 11, color: TEXT_MID, lineHeight: 16 },

  // Reset
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: CARD, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: BORDER, marginTop: 10, marginBottom: 20 },
  resetBtnTxt: { fontSize: 14, fontWeight: '600', color: ACCENT },
});
